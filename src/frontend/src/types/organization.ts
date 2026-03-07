/**
 * Frontend Organization type — mirrors the backend Organization shape
 * with JS-friendly field types (string ids, number timestamps).
 */
export interface Organization {
  /** Stringified backend Nat id */
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  /** Principal string of the creator */
  adminPrincipalText: string;
  /** Milliseconds since epoch (converted from backend bigint nanoseconds) */
  createdAt: number;
  /** Array of stringified VendorId Nats */
  vendorIds: string[];
}
