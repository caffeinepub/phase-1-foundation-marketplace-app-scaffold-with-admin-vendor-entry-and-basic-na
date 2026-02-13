import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useRoleMode } from '../hooks/useRoleMode';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useIsCallerAppOwner } from '../hooks/useMarketplaceQueries';

export default function RoleSelectPage() {
  const { setRoleMode } = useRoleMode();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: isAppOwner, isLoading: isAppOwnerLoading } = useIsCallerAppOwner();
  const navigate = useNavigate();

  const isAuthorized = isAdmin || isAppOwner;
  const isAuthLoading = isAdminLoading || isAppOwnerLoading;

  const handleRoleSelect = (role: 'admin' | 'vendor') => {
    setRoleMode(role);
    navigate({ to: role === 'admin' ? '/admin' : '/vendor' });
  };

  if (!identity) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Select Your Role</h1>
          <p className="text-lg text-muted-foreground">
            Choose how you'd like to access the marketplace
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className={`hover:border-primary transition-colors ${!isAuthLoading && !isAuthorized ? 'opacity-60' : 'cursor-pointer'}`} onClick={() => isAuthorized && handleRoleSelect('admin')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <CardTitle className="text-2xl">Admin</CardTitle>
                  {isAuthLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : isAuthorized ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Authorized
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      Not Authorized
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Manage the marketplace, vendors, and platform settings
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isAuthLoading ? (
                <Button className="w-full" size="lg" disabled>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking Authorization...
                </Button>
              ) : isAuthorized ? (
                <Button className="w-full" size="lg" onClick={() => handleRoleSelect('admin')}>
                  Continue as Admin
                </Button>
              ) : (
                <Button className="w-full" size="lg" disabled variant="outline">
                  Admin or App Owner Access Required
                </Button>
              )}
              <div className="mt-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium">Admin capabilities:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Vendor approval and management</li>
                  <li>Admin assignment and permissions</li>
                  <li>Platform configuration</li>
                  <li>Analytics and reporting</li>
                </ul>
              </div>
              {!isAuthLoading && !isAuthorized && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Your principal is not the app owner and is not in the admin allowlist. Contact an existing admin or claim app ownership to request access.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => handleRoleSelect('vendor')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Vendor</CardTitle>
              <CardDescription>
                Manage your products, orders, and vendor profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" onClick={() => handleRoleSelect('vendor')}>
                Continue as Vendor
              </Button>
              <div className="mt-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium">Vendor capabilities:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Product listing management</li>
                  <li>Order processing</li>
                  <li>Sales analytics</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
