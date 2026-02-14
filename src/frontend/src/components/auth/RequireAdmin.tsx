import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { useIsCallerAdmin, useIsCallerAppOwner, useHasAdmin } from '../../hooks/useMarketplaceQueries';
import { useNavigate } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';

interface RequireAdminProps {
  children: ReactNode;
}

export default function RequireAdmin({ children }: RequireAdminProps) {
  const { data: isAdmin, isLoading: isAdminLoading, error: adminError } = useIsCallerAdmin();
  const { data: isAppOwner, isLoading: isAppOwnerLoading, error: appOwnerError } = useIsCallerAppOwner();
  const { data: hasAdmin, isLoading: hasAdminLoading } = useHasAdmin();
  const navigate = useNavigate();

  const isLoading = isAdminLoading || isAppOwnerLoading || hasAdminLoading;
  const error = adminError || appOwnerError;
  const isAuthorized = isAdmin || isAppOwner;

  // Allow access if user is authorized OR if no admins exist yet (bootstrap scenario)
  const canAccess = isAuthorized || (hasAdmin === false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <CardTitle>Error Checking Authorization</CardTitle>
                <CardDescription>Unable to verify your privileges</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate({ to: '/' })} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-destructive/10">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>Admin or App Owner privileges required</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are not authorized to access this area. Only the app owner or users in the admin allowlist can access admin features.
              </AlertDescription>
            </Alert>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium">To gain admin access:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Ask an existing admin or the app owner to add your principal to the allowlist</li>
                <li>Contact the platform administrator for assistance</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate({ to: '/' })} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Return Home
              </Button>
              <Button onClick={() => navigate({ to: '/select-role' })} variant="default">
                Select Different Role
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
