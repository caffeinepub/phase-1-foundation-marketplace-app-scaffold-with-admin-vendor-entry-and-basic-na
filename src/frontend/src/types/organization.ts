export interface Organization {
  id: string; // UUID generated on creation
  name: string;
  description: string;
  logoUrl: string;
  adminPrincipalText: string; // principal string of creator
  createdAt: number; // Date.now()
  vendorIds: string[]; // array of VendorId.toString()
}
