import { Redirect } from "expo-router";
import { ROUTE_PATHS } from "../utils/navigation";

export default function Index() {
  // TODO: check auth state — redirect to (tabs) if logged in
  return <Redirect href={ROUTE_PATHS.onboarding} />;
}
