import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, CheckCircle, AlertCircle, Store, Database, Activity, UserPlus, UserMinus, Users, Crown, CalendarClock } from 'lucide-react';
import { 
  useAllVendorProfiles, 
  useVerifyVendor, 
  useIsCallerAdmin, 
  useIsCallerAppOwner,
  useUpgradeSummary,
  useGetAdmins,
  useAddAdmin,
  useRemoveAdmin,
  useBootstrapFirstAdmin,
  useGetAppOwner,
  useClaimAppOwner,
  useHasAdmin
} from '../hooks/useMarketplaceQueries';
import { useState } from 'react';
import type { VendorId } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';

export default function AdminPlaceholderPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: isAppOwner, isLoading: isAppOwnerLoading } = useIsCallerAppOwner();
  const { data: hasAdmin, isLoading: hasAdminLoading } = useHasAdmin();
  const { data: appOwner, isLoading: appOwnerLoading } = useGetAppOwner();
  const { data: upgradeSummary, isLoading: summaryLoading, error: summaryError } = useUpgradeSummary();
  
  const isAuthorized = isAdmin || isAppOwner;
  
  // Only fetch admin-gated data when authorized
  const { data: vendors, isLoading: vendorsLoading, error: vendorsError } = useAllVendorProfiles();
  const { data: admins, isLoading: adminsLoading, error: adminsError } = useGetAdmins(isAuthorized);
  
  const verifyVendorMutation = useVerifyVendor();
  const addAdminMutation = useAddAdmin();
  const removeAdminMutation = useRemoveAdmin();
  const bootstrapFirstAdminMutation = useBootstrapFirstAdmin();
  const claimAppOwnerMutation = useClaimAppOwner();
  
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
  const [appOwnerError, setAppOwnerError] = useState<string | null>(null);
  const [appOwnerSuccess, setAppOwnerSuccess] = useState<string | null>(null);
  const [newAdminPrincipal, setNewAdminPrincipal] = useState('');

  const canManageAdmins = isAuthorized && !isAdminLoading && !isAppOwnerLoading;
  const noAdminsExist = hasAdmin === false;
  const showBootstrapUI = isAuthenticated && noAdminsExist && !hasAdminLoading;

  const handleVerify = async (vendorId: VendorId) => {
    setVerifyError(null);
    try {
      await verifyVendorMutation.mutateAsync(vendorId);
    } catch (err: any) {
      setVerifyError(err.message || 'Failed to verify vendor. Please try again.');
    }
  };

  const handleAddAdmin = async () => {
    setAdminError(null);
    setAdminSuccess(null);
    
    if (!newAdminPrincipal.trim()) {
      setAdminError('Please enter a principal ID');
      return;
    }

    try {
      const principal = Principal.fromText(newAdminPrincipal.trim());
      await addAdminMutation.mutateAsync(principal);
      setAdminSuccess(`Successfully added admin: ${principal.toString()}`);
      setNewAdminPrincipal('');
    } catch (err: any) {
      if (err.message?.includes('not a valid principal')) {
        setAdminError('Invalid principal ID format. Please check and try again.');
      } else {
        setAdminError(err.message || 'Failed to add admin. Please try again.');
      }
    }
  };

  const handleRemoveAdmin = async (principal: Principal) => {
    setAdminError(null);
    setAdminSuccess(null);
    
    if (!confirm(`Are you sure you want to remove admin access for ${principal.toString()}?`)) {
      return;
    }

    try {
      await removeAdminMutation.mutateAsync(principal);
      setAdminSuccess(`Successfully removed admin: ${principal.toString()}`);
    } catch (err: any) {
      setAdminError(err.message || 'Failed to remove admin. Please try again.');
    }
  };

  const handleBootstrapFirstAdmin = async () => {
    setAdminError(null);
    setAdminSuccess(null);
    
    try {
      await bootstrapFirstAdminMutation.mutateAsync();
      setAdminSuccess('Successfully claimed initial admin privileges!');
    } catch (err: any) {
      setAdminError(err.message || 'Failed to claim admin. Please try again.');
    }
  };

  const handleClaimAppOwner = async () => {
    setAppOwnerError(null);
    setAppOwnerSuccess(null);
    
    try {
      await claimAppOwnerMutation.mutateAsync();
      setAppOwnerSuccess('Successfully claimed app ownership!');
    } catch (err: any) {
      setAppOwnerError(err.message || 'Failed to claim app ownership. Please try again.');
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
                <p className="text-muted-foreground">Vendor management and verification (Admin or App Owner)</p>
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
              The app owner is the first principal to claim ownership and has full admin privileges
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
                  <code className="text-sm font-mono flex-1">{appOwner.toString()}</code>
                  {identity && appOwner.toString() === identity.getPrincipal().toString() && (
                    <Badge variant="default">You</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  App ownership has been claimed. The owner has full admin privileges.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No app owner has been set. The first user to claim ownership will become the app owner with full admin privileges.
                  </AlertDescription>
                </Alert>
                {isAuthenticated && (
                  <Button 
                    onClick={handleClaimAppOwner}
                    disabled={claimAppOwnerMutation.isPending}
                    className="gap-2"
                  >
                    <Crown className="h-4 w-4" />
                    {claimAppOwnerMutation.isPending ? 'Claiming...' : 'Claim App Ownership'}
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
              Manage the admin allowlist. Admin or App Owner privileges required for management operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bootstrap First Admin UI - shown when no admins exist */}
            {showBootstrapUI && (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No admins have been assigned yet. You can claim initial admin privileges to get started.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={handleBootstrapFirstAdmin}
                  disabled={bootstrapFirstAdminMutation.isPending}
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {bootstrapFirstAdminMutation.isPending ? 'Claiming...' : 'Claim Initial Admin'}
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
                        Failed to load admin list: {adminsError instanceof Error ? adminsError.message : 'Unknown error'}
                      </AlertDescription>
                    </Alert>
                  ) : admins && admins.length > 0 ? (
                    <div className="space-y-2">
                      {admins.map((admin) => (
                        <div key={admin.toString()} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <Shield className="h-4 w-4 text-primary" />
                          <code className="text-sm font-mono flex-1">{admin.toString()}</code>
                          {identity && admin.toString() === identity.getPrincipal().toString() && (
                            <Badge variant="default">You</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAdmin(admin)}
                            disabled={removeAdminMutation.isPending || admins.length === 1}
                            className="gap-1"
                          >
                            <UserMinus className="h-3 w-3" />
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No admins assigned yet.</p>
                  )}
                </div>

                {/* Add New Admin */}
                <div className="space-y-3">
                  <Label htmlFor="newAdminPrincipal">Add New Admin</Label>
                  <div className="flex gap-2">
                    <Input
                      id="newAdminPrincipal"
                      placeholder="Enter principal ID"
                      value={newAdminPrincipal}
                      onChange={(e) => setNewAdminPrincipal(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={handleAddAdmin}
                      disabled={addAdminMutation.isPending || !newAdminPrincipal.trim()}
                      className="gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      {addAdminMutation.isPending ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter the principal ID of the user you want to grant admin privileges.
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

        {/* Users Section - Planned */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-muted-foreground">User Management</CardTitle>
              <Badge variant="outline">Planned</Badge>
            </div>
            <CardDescription>
              View and manage all registered users in the marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              User management features will be available in a future phase. This will include viewing user profiles, activity logs, and user-specific actions.
            </p>
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
              Backend state summary and upgrade information (Admin or App Owner only)
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  {summaryError instanceof Error ? summaryError.message : 'Failed to load upgrade summary'}
                </AlertDescription>
              </Alert>
            ) : upgradeSummary ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Schema Version</p>
                    <p className="text-2xl font-bold">{upgradeSummary.version.toString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Vendor Count</p>
                    <p className="text-2xl font-bold">{upgradeSummary.vendorCount.toString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Product Count</p>
                    <p className="text-2xl font-bold">{upgradeSummary.productCount.toString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Last Vendor ID</p>
                    <p className="text-2xl font-bold">{upgradeSummary.lastVendorId.toString()}</p>
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
              <p className="text-sm text-muted-foreground">No upgrade summary available.</p>
            )}
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
                  {vendorsError instanceof Error ? vendorsError.message : 'Failed to load vendors'}
                </AlertDescription>
              </Alert>
            ) : vendors && vendors.length > 0 ? (
              <div className="space-y-3">
                {vendors.map((vendor) => (
                  <div key={vendor.id.toString()} className="flex items-center justify-between p-4 border rounded-lg">
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
                      <p className="text-sm text-muted-foreground font-mono">{vendor.user.toString()}</p>
                    </div>
                    {!vendor.isVerified && canManageAdmins && (
                      <Button
                        onClick={() => handleVerify(vendor.id)}
                        disabled={verifyVendorMutation.isPending}
                        size="sm"
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {verifyVendorMutation.isPending ? 'Verifying...' : 'Verify'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No vendors registered yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
