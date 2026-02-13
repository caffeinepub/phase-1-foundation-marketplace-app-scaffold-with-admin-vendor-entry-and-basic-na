import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, Server, User } from 'lucide-react';
import { useBackendStatus, useBackendRunning, useWhoAmI } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function ConnectionStatusCard() {
  const { identity } = useInternetIdentity();
  const { data: backendStatus, isLoading: statusLoading, error: statusError } = useBackendStatus();
  const { data: isRunning, isLoading: runningLoading } = useBackendRunning();
  const { data: whoAmI, isLoading: whoAmILoading, error: whoAmIError } = useWhoAmI();

  const isLoading = statusLoading || runningLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Connection Status
        </CardTitle>
        <CardDescription>
          Backend connectivity and authentication status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Checking connection...</span>
          </div>
        ) : statusError ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to connect to backend: {statusError.message}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Backend Status</span>
              <Badge variant={isRunning ? 'default' : 'destructive'}>
                {isRunning ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Running
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Offline
                  </>
                )}
              </Badge>
            </div>

            {backendStatus && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-mono">{backendStatus.version}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Environment</span>
                  <span className="font-mono">{backendStatus.environment}</span>
                </div>
              </>
            )}

            {identity && (
              <div className="pt-3 border-t border-border space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Authentication
                </div>
                
                {whoAmILoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Verifying identity...</span>
                  </div>
                ) : whoAmIError ? (
                  <Alert variant="destructive">
                    <AlertDescription className="text-xs">
                      Authentication check failed
                    </AlertDescription>
                  </Alert>
                ) : whoAmI ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Authenticated
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground break-all font-mono bg-muted p-2 rounded">
                      {whoAmI.toString()}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
