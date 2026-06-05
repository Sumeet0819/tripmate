/**
 * controllers/paymentController.js
 *
 * Handles Stripe payment operations:
 *  1. Create Payment Intent  → POST /api/v1/payments/create-intent
 *  2. Handle Stripe Webhook  → POST /api/v1/payments/webhook
 *
 * Payment Flow:
 *  1. Mobile client calls /create-intent with tripId and platoonId.
 *  2. Express fetches the trip price from Supabase and creates a Stripe
 *     PaymentIntent, Stripe Customer, and Ephemeral Key.
 *  3. Client receives { clientSecret, ephemeralKey, customerId } and
 *     presents the native Stripe Payment Sheet.
 *  4. On successful payment, Stripe fires a webhook to /webhook.
 *  5. Express verifies the webhook signature and calls the Supabase RPC
 *     `add_platoon_member` to add the user to the platoon members array.
 *
 * IMPORTANT:
 *  The /webhook route MUST use `express.raw()` body parser (not express.json())
 *  so that Stripe can verify the signature against the raw request body.
 *  This is configured in app.js BEFORE the global express.json() middleware.
 */

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const supabase = require("../config/supabase");

// ---------------------------------------------------------------------------
// 1. Create Payment Intent
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/payments/create-intent
 *
 * Generates all Stripe secrets required to initialize the native Payment Sheet
 * on the mobile client.
 *
 * Req body: { tripId: "UUID", platoonId: "UUID" }
 * Returns:  { clientSecret, ephemeralKey, customerId }
 *
 * Requires: auth middleware (req.user.id is the buyer's UUID)
 */
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { tripId, platoonId } = req.body;
    const userId = req.user.id;

    // Step 1: Fetch the trip price from Supabase
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("price, title, slots_left")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    // Guard: check trip still has available slots
    if (trip.slots_left <= 0) {
      return res.status(400).json({ error: "This trip is fully booked." });
    }

    // Step 2: Create a Stripe Customer (or retrieve existing in production)
    // For simplicity we create a new customer per transaction.
    // In production, you'd store the stripe customer ID on the user record.
    const customer = await stripe.customers.create({
      metadata: { userId }, // Link Stripe customer back to our user UUID
    });

    // Step 3: Create a short-lived Ephemeral Key for the Payment Sheet
    // The apiVersion must match what @stripe/stripe-react-native expects
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2023-10-16" }
    );

    // Step 4: Create the PaymentIntent with metadata for webhook processing
    // Amount is in the smallest currency unit (Paise for INR: ₹1 = 100 paise)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: trip.price * 100, // Convert INR to Paise
      currency: "inr",
      customer: customer.id,
      // Metadata carries context to the webhook for post-payment DB updates
      metadata: { platoonId, userId, tripId },
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customerId: customer.id,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// 2. Stripe Webhook Handler
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/payments/webhook
 *
 * Receives raw webhook events from Stripe and processes payment confirmations.
 *
 * Security: Stripe signs every webhook payload with a STRIPE_WEBHOOK_SECRET.
 * We use stripe.webhooks.constructEvent() to verify the signature against the
 * raw request body, preventing forged webhook requests.
 *
 * On `payment_intent.succeeded`:
 *  - Extracts platoonId and userId from the PaymentIntent metadata.
 *  - Calls the Supabase RPC `add_platoon_member` to atomically append the
 *    user UUID to the platoon's `members[]` array in Postgres.
 *  - Decrements the trip's `slots_left` counter.
 *
 * NOTE: This route is registered with express.raw() in app.js, NOT express.json()
 */
exports.handleWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Construct and verify the event — throws if signature is invalid
    event = stripe.webhooks.constructEvent(
      req.body,                           // Raw Buffer body (from express.raw)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Route event types to their handlers
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const { platoonId, userId, tripId } = paymentIntent.metadata;

      console.log(`✅ Payment succeeded for platoon ${platoonId} by user ${userId}`);

      try {
        // Atomically add member to platoon via Supabase stored procedure
        // The RPC `add_platoon_member` appends userId to members[] array
        const { error: rpcError } = await supabase.rpc("add_platoon_member", {
          platoon_uuid: platoonId,
          user_uuid: userId,
        });

        if (rpcError) {
          console.error("❌ DB Error adding platoon member:", rpcError.message);
        }

        // Decrement the trip's available slots counter
        const { error: slotError } = await supabase.rpc("decrement_slot", {
          trip_uuid: tripId,
        });

        if (slotError) {
          console.error("❌ DB Error decrementing slot:", slotError.message);
        }
      } catch (dbErr) {
        console.error("❌ Webhook DB operation failed:", dbErr);
      }

      break;
    }

    case "payment_intent.payment_failed": {
      // Log payment failures for monitoring purposes
      const intent = event.data.object;
      console.warn(`⚠️ Payment failed for intent: ${intent.id}`);
      break;
    }

    default:
      // Silently ignore unhandled event types (Stripe sends many event types)
      break;
  }

  // Must respond with 200 to acknowledge receipt; Stripe will retry if not
  res.json({ received: true });
};
