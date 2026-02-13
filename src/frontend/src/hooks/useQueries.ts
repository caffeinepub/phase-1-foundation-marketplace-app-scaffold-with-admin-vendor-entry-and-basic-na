import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Principal } from '@icp-sdk/core/principal';
import type { BackendMetadata } from '../backend';

export function useBackendStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<BackendMetadata>({
    queryKey: ['backendStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getBackendMetadata();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useBackendRunning() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['backendRunning'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        const result = await actor.ping();
        return result;
      } catch (error) {
        // Return false instead of throwing when ping fails
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    retry: false,
  });
}

export function useWhoAmI() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Principal>({
    queryKey: ['whoAmI'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.whoami();
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: false,
  });
}
