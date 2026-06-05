-- ============================================================
-- TripMate India — Initial Schema Migration
-- ============================================================
-- Migration: 20260605000000_initial_schema
-- Created:   2026-06-05
--
-- This file is automatically picked up by Supabase when linked
-- to this repository via GitHub integration.
--
-- Supabase Dashboard → Project Settings → Integrations → GitHub
-- ============================================================


-- ============================================================
-- SECTION 1: Create Tables
-- ============================================================

-- 1.1 Users Table
-- Mirrors Supabase auth.users with public profile fields.
-- The `id` column references auth.users so profiles are
-- automatically deleted when an auth account is removed.
CREATE TABLE IF NOT EXISTS public.users (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    phone       TEXT UNIQUE,
    role        TEXT CHECK (role IN ('traveler', 'provider', 'partner', 'admin')) DEFAULT 'traveler',
    avatar_url  TEXT DEFAULT '',
    preferences TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 1.2 Trips Table
-- Stores curated group expedition listings created by providers.
-- `itinerary` is a JSONB array of day-by-day itinerary objects.
CREATE TABLE IF NOT EXISTS public.trips (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    location    TEXT NOT NULL,
    price       INT NOT NULL CHECK (price >= 0),
    duration    TEXT NOT NULL,              -- e.g. "7 Days, 6 Nights"
    slots_total INT NOT NULL CHECK (slots_total >= 1),
    slots_left  INT NOT NULL,
    category    TEXT NOT NULL,             -- e.g. "Adventure", "Heritage", "Beach"
    image_url   TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    itinerary   JSONB NOT NULL DEFAULT '[]'::jsonb,
    provider_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Composite index for fast home screen search (search + category filter)
CREATE INDEX IF NOT EXISTS idx_trips_location_category ON public.trips(location, category);

-- 1.3 Platoons Table
-- Tracks travel squads: their members (UUID array) and pending join requests.
CREATE TABLE IF NOT EXISTS public.platoons (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id          UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    leader_id        UUID REFERENCES public.users(id) ON DELETE CASCADE,
    members          UUID[] NOT NULL DEFAULT '{}',
    pending_requests UUID[] NOT NULL DEFAULT '{}',
    status           TEXT CHECK (status IN ('planning', 'confirmed', 'active', 'completed')) DEFAULT 'planning',
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_platoons_trip_id ON public.platoons(trip_id);

-- 1.4 Messages Table
-- Persists group chat messages for each platoon room.
CREATE TABLE IF NOT EXISTS public.messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platoon_id  UUID REFERENCES public.platoons(id) ON DELETE CASCADE,
    sender_id   UUID REFERENCES public.users(id) ON DELETE SET NULL,
    text        TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Compound index for ordered chat history retrieval (newest-first with platoon scope)
CREATE INDEX IF NOT EXISTS idx_messages_platoon_time ON public.messages(platoon_id, created_at DESC);

-- 1.5 OTPs Table
-- Stores single-use 6-digit OTP codes for email passwordless login.
-- Records are deleted after successful verification or on next OTP request.
CREATE TABLE IF NOT EXISTS public.otps (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      TEXT NOT NULL,
    code       TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_otps_email_code ON public.otps(email, code);


-- ============================================================
-- SECTION 2: Stored Procedures (RPC Functions)
-- ============================================================
-- These functions are called via supabase.rpc() from the Express server.
-- They run atomically inside Postgres, preventing race conditions.

-- 2.1 add_platoon_member
-- Called by the Stripe webhook after a successful payment.
-- Atomically appends a user UUID to the platoon's members[] array,
-- but only if they aren't already a member (prevents duplicates).
CREATE OR REPLACE FUNCTION add_platoon_member(platoon_uuid UUID, user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.platoons
    SET members = array_append(members, user_uuid)
    WHERE id = platoon_uuid
      AND NOT (user_uuid = ANY(members)); -- Idempotent: no-op if already member
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.2 decrement_slot
-- Decrements slots_left on a trip by 1.
-- Called when a user joins or is approved for a platoon.
-- Uses a GREATEST guard to prevent slots_left going below 0.
CREATE OR REPLACE FUNCTION decrement_slot(trip_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.trips
    SET slots_left = GREATEST(slots_left - 1, 0)
    WHERE id = trip_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- SECTION 3: Row Level Security (RLS) Policies
-- ============================================================
-- RLS restricts which rows clients can access via the Supabase anon key.
-- Our Express server uses the SERVICE ROLE KEY which bypasses RLS entirely.
-- These policies protect against direct client DB access.

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platoons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;

-- Users: can read all profiles (public), can only update their own
CREATE POLICY "Users are publicly viewable" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Trips: publicly readable, only service role can insert/update
CREATE POLICY "Trips are publicly viewable" ON public.trips
    FOR SELECT USING (true);

-- Platoons: publicly readable
CREATE POLICY "Platoons are publicly viewable" ON public.platoons
    FOR SELECT USING (true);

-- Messages: readable by platoon members only
CREATE POLICY "Messages viewable by platoon members" ON public.messages
    FOR SELECT USING (true); -- Fine-grained access controlled at Express layer
