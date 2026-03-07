import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@dfinity/principal";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCircle,
  Crown,
  Database,
  Info,
  Plus,
  Shield,
  ShoppingBag,
  Store,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus, type VendorId } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddAdmin,
  useAllOrders,
  useAllUserProfiles,
  useAllVendorProfiles,
  useBootstrapFirstAdmin,
  useClaimAppOwner,
  useGetAdmins,
  useGetAppOwner,
  useHasAdmin,
  useIsCallerAdmin,
  useIsCallerAppOwner,
  useRemoveAdmin,
  useTotalOrderCount,
  useTotalUserCount,
  useUpdateOrderStatus,
  useUpgradeSummary,
  useVerifyVendor,
} from "../hooks/useMarketplaceQueries";
import {
  useAssignVendorToOrg,
  useCreateOrganization,
  useDeleteOrganization,
  useOrganizationStats,
  useOrganizations,
  useRemoveVendorFromOrg,
} from "../hooks/useOrganizations";

function getOrderStatusConfig(status: OrderStatus | string): {
  label: string;
  className: string;
} {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        className:
          "border-yellow-400 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30",
      };
    case "confirmed":
      return {
        label: "Confirmed",
        className:
          "border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30",
      };
    case "shipped":
      return {
        label: "Shipped",
        className:
          "border-orange-400 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30",
      };
    case "delivered":
      return {
        label: "Delivered",
        className:
          "border-green-400 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className:
          "border-red-400 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30",
      };
    default:
      return { label: String(status), className: "" };
  }
}

function formatAdminPrice(amount: bigint, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(Number(amount) / 100);
}

export default function AdminPlaceholderPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: isAppOwner, isLoading: isAppOwnerLoading } =
    useIsCallerAppOwner();
  const { data: hasAdmin, isLoading: hasAdminLoading } = useHasAdmin();
  const { data: appOwner, isLoading: appOwnerLoading } = useGetAppOwner();
  const {
    data: upgradeSummary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useUpgradeSummary();

  const isAuthorized = isAdmin || isAppOwner;

  // Only fetch admin-gated data when authorized
  const {
    data: vendors,
    isLoading: vendorsLoading,
    error: vendorsError,
  } = useAllVendorProfiles();
  const {
    data: admins,
    isLoading: adminsLoading,
    error: adminsError,
  } = useGetAdmins(isAuthorized);

  const { data: totalUserCount } = useTotalUserCount();
  const {
    data: userProfiles,
    isLoading: usersLoading,
    error: usersError,
  } = useAllUserProfiles(isAuthorized);

  const { data: totalOrderCount } = useTotalOrderCount();
  const {
    data: allOrders,
    isLoading: ordersLoading,
    error: ordersError,
  } = useAllOrders(isAuthorized);

  const verifyVendorMutation = useVerifyVendor();
  const addAdminMutation = useAddAdmin();
  const removeAdminMutation = useRemoveAdmin();
  const bootstrapFirstAdminMutation = useBootstrapFirstAdmin();
  const claimAppOwnerMutation = useClaimAppOwner();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  // Track selected status per order (keyed by order id string)
  const [orderStatusSelections, setOrderStatusSelections] = useState<
    Record<string, string>
  >({});
  const [orderStatusErrors, setOrderStatusErrors] = useState<
    Record<string, string>
  >({});

  const handleUpdateOrderStatus = async (
    orderId: bigint,
    newStatus: OrderStatus,
  ) => {
    const key = orderId.toString();
    setOrderStatusErrors((prev) => ({ ...prev, [key]: "" }));
    try {
      await updateOrderStatusMutation.mutateAsync({ orderId, newStatus });
      toast.success(`Order #${key} status updated to ${newStatus}`);
      // Clear local selection since query will refresh with new status
      setOrderStatusSelections((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update order status";
      setOrderStatusErrors((prev) => ({ ...prev, [key]: msg }));
    }
  };

  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
  const [appOwnerError, setAppOwnerError] = useState<string | null>(null);
  const [appOwnerSuccess, setAppOwnerSuccess] = useState<string | null>(null);
  const [newAdminPrincipal, setNewAdminPrincipal] = useState("");

  // Organizations state
  const { data: organizations = [] } = useOrganizations();
  const { totalOrgs, totalVendorsAssigned } = useOrganizationStats();
  const createOrgMutation = useCreateOrganization();
  const deleteOrgMutation = useDeleteOrganization();
  const assignVendorMutation = useAssignVendorToOrg();
  const removeVendorMutation = useRemoveVendorFromOrg();

  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDescription, setNewOrgDescription] = useState("");
  const [newOrgLogoUrl, setNewOrgLogoUrl] = useState("");
  const [selectedVendorForOrg, setSelectedVendorForOrg] = useState<
    Record<string, string>
  >({});

  const handleCreateOrg = () => {
    if (!newOrgName.trim()) return;
    createOrgMutation.mutate(
      {
        name: newOrgName.trim(),
        description: newOrgDescription.trim(),
        logoUrl: newOrgLogoUrl.trim(),
        adminPrincipalText: identity?.getPrincipal().toString() ?? "",
      },
      {
        onSuccess: () => {
          setNewOrgName("");
          setNewOrgDescription("");
          setNewOrgLogoUrl("");
          setCreateOrgOpen(false);
        },
      },
    );
  };

  const handleDeleteOrg = (orgId: string) => {
    if (!confirm("Are you sure you want to delete this organization?")) return;
    deleteOrgMutation.mutate(orgId);
  };

  const handleAssignVendor = (orgId: string) => {
    const vendorId = selectedVendorForOrg[orgId];
    if (!vendorId) return;
    assignVendorMutation.mutate(
      { orgId, vendorId },
      {
        onSuccess: () => {
          setSelectedVendorForOrg((prev) => ({ ...prev, [orgId]: "" }));
        },
      },
    );
  };

  const handleRemoveVendorFromOrg = (orgId: string, vendorId: string) => {
    removeVendorMutation.mutate({ orgId, vendorId });
  };

  const canManageAdmins = isAuthorized && !isAdminLoading && !isAppOwnerLoading;
  const noAdminsExist = hasAdmin === false;
  const showBootstrapUI = isAuthenticated && noAdminsExist && !hasAdminLoading;

  const handleVerify = async (vendorId: VendorId) => {
    setVerifyError(null);
    try {
      await verifyVendorMutation.mutateAsync(vendorId);
    } catch (err: any) {
      setVerifyError(
        err.message || "Failed to verify vendor. Please try again.",
      );
    }
  };

  const handleAddAdmin = async () => {
    setAdminError(null);
    setAdminSuccess(null);

    if (!newAdminPrincipal.trim()) {
      setAdminError("Please enter a principal ID");
      return;
    }

    try {
      const principal = Principal.fromText(newAdminPrincipal.trim());
      await addAdminMutation.mutateAsync(principal);
      setAdminSuccess(`Successfully added admin: ${principal.toString()}`);
      setNewAdminPrincipal("");
    } catch (err: any) {
      if (err.message?.includes("not a valid principal")) {
        setAdminError(
          "Invalid principal ID format. Please check and try again.",
        );
      } else {
        setAdminError(err.message || "Failed to add admin. Please try again.");
      }
    }
  };

  const handleRemoveAdmin = async (principal: Principal) => {
    setAdminError(null);
    setAdminSuccess(null);

    if (
      !confirm(
        `Are you sure you want to remove admin access for ${principal.toString()}?`,
      )
    ) {
      return;
    }

    try {
      await removeAdminMutation.mutateAsync(principal);
      setAdminSuccess(`Successfully removed admin: ${principal.toString()}`);
    } catch (err: any) {
      setAdminError(err.message || "Failed to remove admin. Please try again.");
    }
  };

  const handleBootstrapFirstAdmin = async () => {
    setAdminError(null);
    setAdminSuccess(null);

    try {
      await bootstrapFirstAdminMutation.mutateAsync();
      setAdminSuccess("Successfully claimed initial admin privileges!");
    } catch (err: any) {
      setAdminError(err.message || "Failed to claim admin. Please try again.");
    }
  };

  const handleClaimAppOwner = async () => {
    setAppOwnerError(null);
    setAppOwnerSuccess(null);

    try {
      await claimAppOwnerMutation.mutateAsync();
      setAppOwnerSuccess("Successfully claimed app ownership!");
    } catch (err: any) {
      setAppOwnerError(
        err.message || "Failed to claim app ownership. Please try again.",
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                  Vendor management and verification (Admin or App Owner)
                </p>
              </div>
            </div>
          </div>
        </div>

        {verifyError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{verifyError}</AlertDescription>
          </Alert>
        )}

        {/* App Owner / Creator Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <CardTitle>App Owner / Creator</CardTitle>
            </div>
            <CardDescription>
              The app owner is the first principal to claim ownership and has
              full admin privileges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {appOwnerLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : appOwner ? (
              <div className="space-y-2">
                <Label>Current App Owner</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Crown className="h-4 w-4 text-primary" />
                  <code className="text-sm font-mono flex-1">
                    {appOwner.toString()}
                  </code>
                  {identity &&
                    appOwner.toString() ===
                      identity.getPrincipal().toString() && (
                      <Badge variant="default">You</Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                  App ownership has been claimed. The owner has full admin
                  privileges.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No app owner has been set. The first user to claim ownership
                    will become the app owner with full admin privileges.
                  </AlertDescription>
                </Alert>
                {isAuthenticated && (
                  <Button
                    data-ocid="admin.claim_app_owner.button"
                    onClick={handleClaimAppOwner}
                    disabled={claimAppOwnerMutation.isPending}
                    className="gap-2"
                  >
                    <Crown className="h-4 w-4" />
                    {claimAppOwnerMutation.isPending
                      ? "Claiming..."
                      : "Claim App Ownership"}
                  </Button>
                )}
                {appOwnerError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{appOwnerError}</AlertDescription>
                  </Alert>
                )}
                {appOwnerSuccess && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{appOwnerSuccess}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Assignment Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Admin Assignment</CardTitle>
            </div>
            <CardDescription>
              Manage the admin allowlist. Admin or App Owner privileges required
              for management operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bootstrap First Admin UI - shown when no admins exist */}
            {showBootstrapUI && (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No admins have been assigned yet. You can claim initial
                    admin privileges to get started.
                  </AlertDescription>
                </Alert>
                <Button
                  data-ocid="admin.bootstrap_admin.button"
                  onClick={handleBootstrapFirstAdmin}
                  disabled={bootstrapFirstAdminMutation.isPending}
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {bootstrapFirstAdminMutation.isPending
                    ? "Claiming..."
                    : "Claim Initial Admin"}
                </Button>
              </div>
            )}

            {/* Admin Management UI - shown when authorized */}
            {canManageAdmins && (
              <>
                {/* Current Admins List */}
                <div className="space-y-3">
                  <Label>Current Admins</Label>
                  {adminsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : adminsError ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to load admin list:{" "}
                        {adminsError instanceof Error
                          ? adminsError.message
                          : "Unknown error"}
                      </AlertDescription>
                    </Alert>
                  ) : admins && admins.length > 0 ? (
                    <div className="space-y-2">
                      {admins.map((admin) => (
                        <div
                          key={admin.toString()}
                          className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                        >
                          <Shield className="h-4 w-4 text-primary" />
                          <code className="text-sm font-mono flex-1">
                            {admin.toString()}
                          </code>
                          {identity &&
                            admin.toString() ===
                              identity.getPrincipal().toString() && (
                              <Badge variant="default">You</Badge>
                            )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAdmin(admin)}
                            disabled={
                              removeAdminMutation.isPending ||
                              admins.length === 1
                            }
                            className="gap-1"
                          >
                            <UserMinus className="h-3 w-3" />
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No admins assigned yet.
                    </p>
                  )}
                </div>

                {/* Add New Admin */}
                <div className="space-y-3">
                  <Label htmlFor="newAdminPrincipal">Add New Admin</Label>
                  <div className="flex gap-2">
                    <Input
                      data-ocid="admin.add_admin.input"
                      id="newAdminPrincipal"
                      placeholder="Enter principal ID"
                      value={newAdminPrincipal}
                      onChange={(e) => setNewAdminPrincipal(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Button
                      data-ocid="admin.add_admin.button"
                      onClick={handleAddAdmin}
                      disabled={
                        addAdminMutation.isPending || !newAdminPrincipal.trim()
                      }
                      className="gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      {addAdminMutation.isPending ? "Adding..." : "Add"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter the principal ID of the user you want to grant admin
                    privileges.
                  </p>
                </div>
              </>
            )}

            {/* Status Messages */}
            {adminError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{adminError}</AlertDescription>
              </Alert>
            )}
            {adminSuccess && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{adminSuccess}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* User Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>User Management</CardTitle>
              {totalUserCount !== undefined && (
                <Badge variant="secondary">
                  {totalUserCount.toString()} registered
                </Badge>
              )}
            </div>
            <CardDescription>
              View all registered users in the marketplace (Admin or App Owner
              only)
            </CardDescription>
          </CardHeader>
          <CardContent data-ocid="admin.users.panel">
            {usersLoading ? (
              <div data-ocid="admin.users.loading_state" className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : usersError ? (
              <Alert variant="destructive" data-ocid="admin.users.error_state">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {usersError instanceof Error
                    ? usersError.message
                    : "Failed to load users. Admin or App Owner privileges required."}
                </AlertDescription>
              </Alert>
            ) : !isAuthorized ? (
              <Alert data-ocid="admin.users.error_state">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Admin or App Owner privileges required to view users.
                </AlertDescription>
              </Alert>
            ) : userProfiles && userProfiles.length > 0 ? (
              <div data-ocid="admin.users.list" className="space-y-2">
                {userProfiles.map((entry, index) => (
                  <div
                    key={entry.principal.toString()}
                    data-ocid={`admin.users.item.${index + 1}`}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 shrink-0">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {entry.profile.name || "Anonymous User"}
                      </p>
                      <code className="text-xs font-mono text-muted-foreground truncate block">
                        {entry.principal.toString()}
                      </code>
                    </div>
                    {identity &&
                      entry.principal.toString() ===
                        identity.getPrincipal().toString() && (
                        <Badge variant="default" className="shrink-0">
                          You
                        </Badge>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                data-ocid="admin.users.empty_state"
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted mb-3">
                  <CalendarClock className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  No registered users yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Users will appear here once they sign in and create profiles.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade Diagnostics Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Upgrade Diagnostics</CardTitle>
            </div>
            <CardDescription>
              Backend state summary and upgrade information (Admin or App Owner
              only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              data-ocid="admin.upgrade_diagnostics.panel"
              className="space-y-4"
            >
              {summaryLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : summaryError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {summaryError instanceof Error
                      ? summaryError.message
                      : "Failed to load upgrade summary"}
                  </AlertDescription>
                </Alert>
              ) : upgradeSummary ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Schema Version
                      </p>
                      <p className="text-2xl font-bold">
                        {upgradeSummary.version.toString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Vendor Count
                      </p>
                      <p className="text-2xl font-bold">
                        {upgradeSummary.vendorCount.toString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Product Count
                      </p>
                      <p className="text-2xl font-bold">
                        {upgradeSummary.productCount.toString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Last Vendor ID
                      </p>
                      <p className="text-2xl font-bold">
                        {upgradeSummary.lastVendorId.toString()}
                      </p>
                    </div>
                  </div>

                  {/* Upgrade Guidance */}
                  <div
                    data-ocid="upgrade_diagnostics.panel"
                    className="grid sm:grid-cols-2 gap-3"
                  >
                    {/* Before upgrading */}
                    <div className="rounded-lg bg-muted/50 border border-border/50 p-3 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <Info className="h-3.5 w-3.5" />
                        Before Upgrading
                      </div>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-primary/60" />
                          Note current vendor count (
                          {upgradeSummary.vendorCount.toString()}) and product
                          count ({upgradeSummary.productCount.toString()})
                        </li>
                        <li className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-primary/60" />
                          Verify the app loads and /admin is accessible
                        </li>
                      </ul>
                    </div>
                    {/* After upgrading */}
                    <div className="rounded-lg bg-muted/50 border border-border/50 p-3 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                        After Upgrading
                      </div>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-primary/60" />
                          Confirm vendor count and product count match
                          pre-upgrade values
                        </li>
                        <li className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-primary/60" />
                          Verify /admin is accessible and counts are displayed
                          correctly
                        </li>
                      </ul>
                    </div>
                  </div>

                  <Alert>
                    <Activity className="h-4 w-4" />
                    <AlertDescription>
                      Backend is operational. All state counters are accessible.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No upgrade summary available.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vendor Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <CardTitle>Vendor Management</CardTitle>
            </div>
            <CardDescription>
              Review and verify vendor profiles (Admin or App Owner only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vendorsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : vendorsError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {vendorsError instanceof Error
                    ? vendorsError.message
                    : "Failed to load vendors"}
                </AlertDescription>
              </Alert>
            ) : vendors && vendors.length > 0 ? (
              <div className="space-y-3">
                {vendors.map((vendor) => (
                  <div
                    key={vendor.id.toString()}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{vendor.companyName}</p>
                        {vendor.isVerified && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">
                        {vendor.user.toString()}
                      </p>
                    </div>
                    {!vendor.isVerified && canManageAdmins && (
                      <Button
                        onClick={() => handleVerify(vendor.id)}
                        disabled={verifyVendorMutation.isPending}
                        size="sm"
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {verifyVendorMutation.isPending
                          ? "Verifying..."
                          : "Verify"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No vendors registered yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Organizations Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle>Organizations</CardTitle>
                <Badge variant="secondary">
                  {totalOrgs} {totalOrgs === 1 ? "org" : "orgs"}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  {totalVendorsAssigned} assigned
                </Badge>
              </div>
              <Dialog open={createOrgOpen} onOpenChange={setCreateOrgOpen}>
                <DialogTrigger asChild>
                  <Button
                    data-ocid="admin.create_org.button"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Organization
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Organization</DialogTitle>
                    <DialogDescription>
                      Create a new organization to group vendors together.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">
                        Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        data-ocid="admin.create_org.name.input"
                        id="orgName"
                        placeholder="Organization name"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgDescription">Description</Label>
                      <Textarea
                        data-ocid="admin.create_org.description.textarea"
                        id="orgDescription"
                        placeholder="Describe this organization..."
                        value={newOrgDescription}
                        onChange={(e) => setNewOrgDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgLogoUrl">Logo URL</Label>
                      <Input
                        data-ocid="admin.create_org.logoUrl.input"
                        id="orgLogoUrl"
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={newOrgLogoUrl}
                        onChange={(e) => setNewOrgLogoUrl(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setCreateOrgOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      data-ocid="admin.create_org.submit_button"
                      onClick={handleCreateOrg}
                      disabled={
                        !newOrgName.trim() || createOrgMutation.isPending
                      }
                    >
                      {createOrgMutation.isPending
                        ? "Creating..."
                        : "Create Organization"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription>
              Group vendors into organizations for better discoverability
            </CardDescription>
          </CardHeader>
          <CardContent>
            {organizations.length === 0 ? (
              <div
                data-ocid="admin.orgs.empty_state"
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted mb-3">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  No organizations yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create organizations to group vendors together.
                </p>
              </div>
            ) : (
              <div data-ocid="admin.orgs.list" className="space-y-4">
                {organizations.map((org, index) => (
                  <div
                    key={org.id}
                    data-ocid={`admin.orgs.item.${index + 1}`}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    {/* Org header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {org.logoUrl ? (
                          <img
                            src={org.logoUrl}
                            alt={org.name}
                            className="h-10 w-10 rounded-md object-cover border border-border flex-shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "";
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{org.name}</p>
                          {org.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {org.description}
                            </p>
                          )}
                          <Badge
                            variant="secondary"
                            className="text-xs mt-1 gap-1"
                          >
                            <Users className="h-3 w-3" />
                            {org.vendorIds.length}{" "}
                            {org.vendorIds.length === 1 ? "vendor" : "vendors"}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        data-ocid="admin.orgs.delete.button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive gap-1 flex-shrink-0"
                        onClick={() => handleDeleteOrg(org.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>

                    {/* Assigned vendors */}
                    {org.vendorIds.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Assigned Vendors
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {org.vendorIds.map((vid) => {
                            const matchedVendor = vendors?.find(
                              (v) => v.id.toString() === vid,
                            );
                            return (
                              <Badge
                                key={vid}
                                variant="outline"
                                className="gap-1 pr-1"
                              >
                                <Store className="h-3 w-3" />
                                {matchedVendor?.companyName ?? `Vendor #${vid}`}
                                <button
                                  type="button"
                                  className="ml-1 hover:text-destructive transition-colors"
                                  onClick={() =>
                                    handleRemoveVendorFromOrg(org.id, vid)
                                  }
                                  aria-label={`Remove vendor ${vid}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Assign vendor */}
                    {vendors && vendors.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedVendorForOrg[org.id] ?? ""}
                          onValueChange={(value) =>
                            setSelectedVendorForOrg((prev) => ({
                              ...prev,
                              [org.id]: value,
                            }))
                          }
                        >
                          <SelectTrigger
                            data-ocid="admin.orgs.assign_vendor.select"
                            className="flex-1 text-sm h-9"
                          >
                            <SelectValue placeholder="Select a vendor to assign..." />
                          </SelectTrigger>
                          <SelectContent>
                            {vendors
                              .filter(
                                (v) => !org.vendorIds.includes(v.id.toString()),
                              )
                              .map((v) => (
                                <SelectItem
                                  key={v.id.toString()}
                                  value={v.id.toString()}
                                >
                                  {v.companyName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button
                          data-ocid="admin.orgs.assign_vendor.button"
                          size="sm"
                          disabled={
                            !selectedVendorForOrg[org.id] ||
                            assignVendorMutation.isPending
                          }
                          onClick={() => handleAssignVendor(org.id)}
                          className="gap-1 flex-shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                          Assign
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <CardTitle>Orders Management</CardTitle>
              {totalOrderCount !== undefined && (
                <Badge variant="secondary">
                  {totalOrderCount.toString()} total
                </Badge>
              )}
            </div>
            <CardDescription>
              View all marketplace orders (Admin or App Owner only)
            </CardDescription>
          </CardHeader>
          <CardContent data-ocid="admin.orders.panel">
            {ordersLoading ? (
              <div data-ocid="admin.orders.loading_state" className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : ordersError ? (
              <Alert variant="destructive" data-ocid="admin.orders.error_state">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {ordersError instanceof Error
                    ? ordersError.message
                    : "Failed to load orders. Admin or App Owner privileges required."}
                </AlertDescription>
              </Alert>
            ) : !isAuthorized ? (
              <Alert data-ocid="admin.orders.error_state">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Admin or App Owner privileges required to view all orders.
                </AlertDescription>
              </Alert>
            ) : allOrders && allOrders.length > 0 ? (
              <div className="space-y-3">
                {allOrders
                  .slice()
                  .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
                  .map((order, index) => {
                    const orderKey = order.id.toString();
                    const currentStatus = order.status as string;
                    const statusConfig = getOrderStatusConfig(currentStatus);
                    const buyerStr = order.buyer.toString();
                    const shortBuyer = `${buyerStr.slice(0, 8)}...${buyerStr.slice(-6)}`;
                    const selectedStatus =
                      orderStatusSelections[orderKey] ?? currentStatus;
                    const hasChanged = selectedStatus !== currentStatus;
                    const rowError = orderStatusErrors[orderKey];
                    const isUpdating =
                      updateOrderStatusMutation.isPending &&
                      updateOrderStatusMutation.variables?.orderId.toString() ===
                        orderKey;

                    return (
                      <div
                        key={orderKey}
                        data-ocid={`admin.orders.item.${index + 1}`}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        {/* Top row: order info + price */}
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-mono text-muted-foreground">
                                #{orderKey}
                              </span>
                              <Badge
                                variant="outline"
                                className={statusConfig.className}
                              >
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono truncate">
                              Buyer: {shortBuyer}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                Number(order.createdAt) / 1_000_000,
                              ).toLocaleDateString()}
                              {" · "}
                              {order.items.length} item
                              {order.items.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-primary">
                              {formatAdminPrice(
                                order.totalAmount,
                                order.currency,
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Status update controls */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Select
                            value={selectedStatus}
                            onValueChange={(value) =>
                              setOrderStatusSelections((prev) => ({
                                ...prev,
                                [orderKey]: value,
                              }))
                            }
                            disabled={isUpdating}
                          >
                            <SelectTrigger
                              data-ocid={`admin.orders.status_select.${index + 1}`}
                              className="h-8 w-[140px] text-xs"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={OrderStatus.pending}>
                                Pending
                              </SelectItem>
                              <SelectItem value={OrderStatus.confirmed}>
                                Confirmed
                              </SelectItem>
                              <SelectItem value={OrderStatus.shipped}>
                                Shipped
                              </SelectItem>
                              <SelectItem value={OrderStatus.delivered}>
                                Delivered
                              </SelectItem>
                              <SelectItem value={OrderStatus.cancelled}>
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            data-ocid={`admin.orders.update_status.button.${index + 1}`}
                            size="sm"
                            variant={hasChanged ? "default" : "outline"}
                            disabled={!hasChanged || isUpdating}
                            onClick={() =>
                              handleUpdateOrderStatus(
                                order.id,
                                selectedStatus as OrderStatus,
                              )
                            }
                            className="h-8 text-xs px-3"
                          >
                            {isUpdating ? "Updating…" : "Update"}
                          </Button>
                        </div>

                        {/* Inline error */}
                        {rowError && (
                          <p
                            data-ocid="admin.orders.error_state"
                            className="text-xs text-destructive"
                          >
                            {rowError}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div
                data-ocid="admin.orders.empty_state"
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted mb-3">
                  <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  No orders yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Orders will appear here once buyers complete purchases.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
