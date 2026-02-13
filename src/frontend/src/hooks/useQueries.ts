import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@icp-sdk/core/principal';

export function useBackendStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<{ version: string; environment: string }>({
    queryKey: ['backendStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      // Backend method not implemented - return placeholder
      return { version: 'Phase 2', environment: 'development' };
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
      if (!actor) throw new Error('Actor not initialized');
      // Backend method not implemented - return true if actor exists
      return true;
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useWhoAmI() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal>({
    queryKey: ['whoAmI'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      // Backend method not implemented - get from actor's caller
      // This is a placeholder - the actual principal comes from the identity
      throw new Error('whoAmI not implemented');
    },
    enabled: false, // Disabled until backend implements this
    retry: false,
  });
}
