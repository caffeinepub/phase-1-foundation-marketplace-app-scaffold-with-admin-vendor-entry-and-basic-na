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
  useClaimAppOwner
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
  const { data: appOwner, isLoading: appOwnerLoading } = useGetAppOwner();
  const { data: upgradeSummary, isLoading: summaryLoading, error: summaryError } = useUpgradeSummary();
  const { data: vendors, isLoading, error } = useAllVendorProfiles();
  const { data: admins, isLoading: adminsLoading, error: adminsError } = useGetAdmins();
  
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

  const isAuthorized = isAdmin || isAppOwner;
  const canManageAdmins = isAuthorized && !isAdminLoading && !isAppOwnerLoading;
  const noAdminsExist = admins && admins.length === 0;

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
                <p className="text-muted-foreground">Vendor management and verification</p>
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
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              App Owner / Creator
            </CardTitle>
            <CardDescription>
              The app owner has full administrative privileges and can manage the admin allowlist
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current App Owner */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
                <Crown className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Current App Owner:</span>
                {appOwnerLoading ? (
                  <Skeleton className="h-5 w-48" />
                ) : appOwner ? (
                  <span className="font-mono text-sm flex-1 break-all">{appOwner.toString()}</span>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Not set</span>
                )}
              </div>

              {/* Your App Owner Status */}
              {isAuthenticated && (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Your Status:</span>
                  {isAppOwnerLoading ? (
                    <Skeleton className="h-5 w-24" />
                  ) : isAppOwner ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      You are the App Owner
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Not App Owner
                    </Badge>
                  )}
                </div>
              )}
            </div>

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

            {/* Claim App Owner (only if no owner exists) */}
            {!appOwnerLoading && !appOwner && isAuthenticated && (
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Claim App Ownership
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No app owner has been set yet. You can claim ownership of this application. This is a one-time action and cannot be undone.
                  </p>
                </div>
                <Button 
                  onClick={handleClaimAppOwner}
                  disabled={claimAppOwnerMutation.isPending}
                  className="gap-2"
                >
                  {claimAppOwnerMutation.isPending ? (
                    <>
                      <Activity className="h-4 w-4 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4" />
                      Claim App Ownership
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* App Owner Already Set */}
            {!appOwnerLoading && appOwner && (
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  App ownership has been claimed and cannot be transferred. The app owner has permanent administrative access.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Assignment Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Admin Assignment
            </CardTitle>
            <CardDescription>
              Manage admin allowlist access (available to Admin or App Owner)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Admin Status */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Your Admin Status:</span>
              {isAdminLoading ? (
                <Skeleton className="h-5 w-24" />
              ) : isAdmin ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Authorized
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Not in Allowlist
                </Badge>
              )}
            </div>

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

            {/* Bootstrap First Admin (only if no admins exist and user is not authorized) */}
            {!isAdminLoading && !isAppOwnerLoading && !isAuthorized && !adminsLoading && noAdminsExist && (
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Claim Initial Admin
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No admins exist yet. You can claim initial admin privileges for this deployment.
                  </p>
                </div>
                <Button 
                  onClick={handleBootstrapFirstAdmin}
                  disabled={bootstrapFirstAdminMutation.isPending}
                  className="gap-2"
                >
                  {bootstrapFirstAdminMutation.isPending ? (
                    <>
                      <Activity className="h-4 w-4 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Claim Initial Admin
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Admin Management (only for authorized users: admin OR app owner) */}
            {canManageAdmins && (
              <>
                {/* Add Admin */}
                <div className="space-y-4 p-4 border rounded-lg bg-card">
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add Admin
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Enter a principal ID to grant admin privileges
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="newAdminPrincipal">Principal ID</Label>
                      <Input
                        id="newAdminPrincipal"
                        placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                        value={newAdminPrincipal}
                        onChange={(e) => setNewAdminPrincipal(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={handleAddAdmin}
                        disabled={addAdminMutation.isPending || !newAdminPrincipal.trim()}
                        className="gap-2"
                      >
                        {addAdminMutation.isPending ? (
                          <>
                            <Activity className="h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Current Admins List */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Current Admins
                  </h3>
                  {adminsLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                          <Skeleton className="h-4 flex-1" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : adminsError ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to load admin list. {adminsError instanceof Error ? adminsError.message : 'Please try again later.'}
                      </AlertDescription>
                    </Alert>
                  ) : !admins || admins.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No admins found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {admins.map((admin) => (
                        <div
                          key={admin.toString()}
                          className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 font-mono text-sm break-all">
                            {admin.toString()}
                          </div>
                          {identity && admin.toString() === identity.getPrincipal().toString() && (
                            <Badge variant="outline" className="shrink-0">You</Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveAdmin(admin)}
                            disabled={removeAdminMutation.isPending || admins.length === 1}
                            className="gap-2 shrink-0"
                          >
                            <UserMinus className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      ))}
                      {admins.length === 1 && (
                        <p className="text-xs text-muted-foreground italic">
                          Cannot remove the last admin. Add another admin first.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Not Authorized Message */}
            {!canManageAdmins && !noAdminsExist && (
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  You must be an admin or the app owner to manage the admin allowlist.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users (Planned) Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Users (Planned)
            </CardTitle>
            <CardDescription>
              Comprehensive user management coming in a future phase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">
                End-to-end user lifecycle management is planned for a later phase. This will include:
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-muted-foreground">
                <li>User directory and browsing</li>
                <li>Advanced user permissions and role management</li>
                <li>User activity tracking and analytics</li>
                <li>User moderation and content management</li>
              </ul>
              <p className="text-sm text-muted-foreground italic">
                Currently, users are managed through Internet Identity authentication and vendor profiles.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Diagnostics Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Upgrade Diagnostics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : summaryError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load upgrade summary. {summaryError instanceof Error ? summaryError.message : 'Please try again later.'}
                </AlertDescription>
              </Alert>
            ) : upgradeSummary ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="text-2xl font-bold">{upgradeSummary.version.toString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Vendors</p>
                  <p className="text-2xl font-bold">{upgradeSummary.vendorCount.toString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold">{upgradeSummary.productCount.toString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Last Vendor ID</p>
                  <p className="text-2xl font-bold">{upgradeSummary.lastVendorId.toString()}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Vendor Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Vendor Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load vendors. {error instanceof Error ? error.message : 'Please try again later.'}
                </AlertDescription>
              </Alert>
            ) : !vendors || vendors.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No vendors yet</p>
                <p className="text-sm">Vendors will appear here once they register</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vendors.map((vendor) => (
                  <div
                    key={vendor.id.toString()}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{vendor.companyName}</p>
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
                        {verifyVendorMutation.isPending ? (
                          <>
                            <Activity className="h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Verify
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
