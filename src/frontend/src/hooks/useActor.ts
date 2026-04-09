/**
 * Returns an authenticated Backend actor instance.
 *
 * The actor is recreated automatically when the Internet Identity changes
 * (login / logout). While the actor is being initialised, `isFetching` is true.
 *
 * Returns:
 *   actor      - Backend | null  (null only during initial fetch)
 *   isFetching - true while the actor is being created or refreshed
 */
import { useActor as useCoreActor } from "@caffeineai/core-infrastructure";
import { type Backend, createActor } from "../backend";

export function useActor(): { actor: Backend | null; isFetching: boolean } {
  return useCoreActor(createActor);
}
