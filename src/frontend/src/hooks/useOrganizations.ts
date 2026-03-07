import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Organization as BackendOrg,
  OrganizationId,
  VendorId,
} from "../backend";
import type { Organization } from "../types/organization";
import { useActor } from "./useActor";

const QUERY_KEY = ["organizations"] as const;

// ─── Shape converter ───────────────────────────────────────────────────────

function fromBackend(org: BackendOrg): Organization {
  return {
    id: org.id.toString(),
    name: org.name,
    description: org.description,
    logoUrl: org.logoUrl,
    adminPrincipalText: org.adminPrincipal.toString(),
    // Backend timestamp is nanoseconds (Int/bigint); convert to ms
    createdAt: Number(org.createdAt) / 1_000_000,
    vendorIds: org.vendorIds.map((v) => v.toString()),
  };
}

// ─── Query hooks ───────────────────────────────────────────────────────────

/** Returns all organizations from the backend canister. */
export function useOrganizations() {
  const { actor, isFetching } = useActor();

  return useQuery<Organization[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      const orgs = await actor.getAllOrganizations();
      return orgs.map(fromBackend);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

/** Returns a single organization by ID from the React Query cache. */
export function useOrganization(id: string): Organization | null {
  const { data = [] } = useOrganizations();
  return data.find((o) => o.id === id) ?? null;
}

/** Returns aggregate stats across all organizations. */
export function useOrganizationStats(): {
  totalOrgs: number;
  totalVendorsAssigned: number;
} {
  const { data = [] } = useOrganizations();
  return {
    totalOrgs: data.length,
    totalVendorsAssigned: data.reduce((acc, o) => acc + o.vendorIds.length, 0),
  };
}

/** Returns the organization a given vendor belongs to (or null). */
export function useVendorOrganization(vendorId: string): Organization | null {
  const { data = [] } = useOrganizations();
  return data.find((o) => o.vendorIds.includes(vendorId)) ?? null;
}

// ─── Mutation hooks ────────────────────────────────────────────────────────

/** Creates a new organization via the backend canister. Admin/owner only. */
export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation<
    Organization,
    Error,
    Omit<Organization, "id" | "createdAt" | "vendorIds">
  >({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Actor not initialized");
      const newId: OrganizationId = await actor.createOrganization(
        data.name,
        data.description,
        data.logoUrl,
      );
      const org = await actor.getOrganization(newId);
      if (!org) throw new Error("Organization not found after creation");
      return fromBackend(org);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/** Updates an existing organization via the backend canister. Admin/owner only. */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation<
    void,
    Error,
    { id: string; data: Partial<Omit<Organization, "id" | "createdAt">> }
  >({
    mutationFn: async ({ id, data }) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.updateOrganization(
        BigInt(id) as OrganizationId,
        data.name ?? "",
        data.description ?? "",
        data.logoUrl ?? "",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/** Deletes an organization via the backend canister. Admin/owner only. */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.deleteOrganization(BigInt(id) as OrganizationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/** Assigns a vendor to an organization (exclusive membership). Admin/owner only. */
export function useAssignVendorToOrg() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation<void, Error, { orgId: string; vendorId: string }>({
    mutationFn: async ({ orgId, vendorId }) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.assignVendorToOrg(
        BigInt(orgId) as OrganizationId,
        BigInt(vendorId) as VendorId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/** Removes a vendor from an organization. Admin/owner only. */
export function useRemoveVendorFromOrg() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation<void, Error, { orgId: string; vendorId: string }>({
    mutationFn: async ({ orgId, vendorId }) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.removeVendorFromOrg(
        BigInt(orgId) as OrganizationId,
        BigInt(vendorId) as VendorId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
