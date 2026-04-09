/**
 * Re-exports the useInternetIdentity hook from @caffeineai/core-infrastructure.
 * This provides access to Internet Identity authentication state and actions.
 *
 * Returns:
 *   identity       - The authenticated Identity, or undefined if not logged in
 *   login          - Trigger the Internet Identity login flow
 *   clear          - Log out (clears identity from state and storage)
 *   loginStatus    - "initializing" | "idle" | "logging-in" | "success" | "loginError"
 *   isInitializing - true while the auth client is loading from storage
 *   isLoginIdle    - true when no login is in progress
 *   isLoggingIn    - true while the login popup is open
 *   isLoginSuccess - true after a successful login
 *   isLoginError   - true if login failed
 *   loginError     - Error object if login failed
 */
export {
  useInternetIdentity,
  type InternetIdentityContext,
  type Status,
} from "@caffeineai/core-infrastructure";

import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Principal } from "@icp-sdk/core/principal";

/**
 * Returns the caller's Principal. Falls back to the anonymous principal
 * if the user is not authenticated.
 */
export function useGetPrincipal(): Principal {
  const { identity } = useInternetIdentity();
  if (identity) {
    return identity.getPrincipal();
  }
  return Principal.anonymous();
}
