import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Organization } from "../types/organization";

const STORAGE_KEY = "marketplace_organizations";
const QUERY_KEY = ["organizations"] as const;

// ─── localStorage adapter ──────────────────────────────────────────────────

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function readOrganizations(): Organization[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Organization[];
  } catch {
    return [];
  }
}

function writeOrganizations(orgs: Organization[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orgs));
  } catch {
    // silently fail if localStorage is unavailable
  }
}

// ─── Query hooks ───────────────────────────────────────────────────────────

/** Returns all organizations, backed by React Query cache. */
export function useOrganizations() {
  return useQuery<Organization[]>({
    queryKey: QUERY_KEY,
    queryFn: readOrganizations,
    // localStorage is synchronous — no stale-while-revalidate delay needed
    staleTime: 0,
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

/** Creates a new organization and invalidates the cache. */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation<
    Organization,
    Error,
    Omit<Organization, "id" | "createdAt" | "vendorIds">
  >({
    mutationFn: (data) => {
      const orgs = readOrganizations();
      const newOrg: Organization = {
        id: generateUUID(),
        createdAt: Date.now(),
        vendorIds: [],
        ...data,
      };
      writeOrganizations([...orgs, newOrg]);
      return Promise.resolve(newOrg);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/** Updates an existing organization and invalidates the cache. */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { id: string; data: Partial<Omit<Organization, "id" | "createdAt">> }
  >({
    mutationFn: ({ id, data }) => {
      const orgs = readOrganizations();
      const updated = orgs.map((o) => (o.id === id ? { ...o, ...data } : o));
      writeOrganizations(updated);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/** Deletes an organization and invalidates the cache. */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => {
      const orgs = readOrganizations();
      writeOrganizations(orgs.filter((o) => o.id !== id));
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/** Assigns a vendor to an organization (exclusive membership) and invalidates the cache. */
export function useAssignVendorToOrg() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { orgId: string; vendorId: string }>({
    mutationFn: ({ orgId, vendorId }) => {
      const orgs = readOrganizations();
      // Remove vendor from any existing org first (exclusive membership)
      const cleaned = orgs.map((o) => ({
        ...o,
        vendorIds: o.vendorIds.filter((v) => v !== vendorId),
      }));
      // Add to target org
      const updated = cleaned.map((o) =>
        o.id === orgId && !o.vendorIds.includes(vendorId)
          ? { ...o, vendorIds: [...o.vendorIds, vendorId] }
          : o,
      );
      writeOrganizations(updated);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/** Removes a vendor from an organization and invalidates the cache. */
export function useRemoveVendorFromOrg() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { orgId: string; vendorId: string }>({
    mutationFn: ({ orgId, vendorId }) => {
      const orgs = readOrganizations();
      const updated = orgs.map((o) =>
        o.id === orgId
          ? { ...o, vendorIds: o.vendorIds.filter((v) => v !== vendorId) }
          : o,
      );
      writeOrganizations(updated);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
