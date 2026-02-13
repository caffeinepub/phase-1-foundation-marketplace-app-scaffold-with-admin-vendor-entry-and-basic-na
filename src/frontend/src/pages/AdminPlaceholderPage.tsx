import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Info, Users, Package, Settings, BarChart } from 'lucide-react';
import ConnectionStatusCard from '../components/status/ConnectionStatusCard';

export default function AdminPlaceholderPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Marketplace administration and management</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-base px-4 py-2">
            Phase 1
          </Badge>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Phase 1 Placeholder:</strong> Admin management features including vendor approval, 
            platform configuration, and analytics will be implemented in Phase 4 and beyond. 
            This page demonstrates the protected route structure and authentication flow.
          </AlertDescription>
        </Alert>

        <ConnectionStatusCard />

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Vendor Management</CardTitle>
              </div>
              <CardDescription>Coming in Phase 4</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Planned features:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Approve or disable vendor accounts</li>
                <li>Review vendor applications</li>
                <li>Manage vendor permissions</li>
                <li>View vendor activity logs</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle>Product Moderation</CardTitle>
              </div>
              <CardDescription>Coming in Phase 5</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Planned features:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Review and approve product listings</li>
                <li>Manage product categories</li>
                <li>Handle reported content</li>
                <li>Set marketplace policies</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                <CardTitle>Analytics Dashboard</CardTitle>
              </div>
              <CardDescription>Coming in Phase 5</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Planned features:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Marketplace performance metrics</li>
                <li>Vendor activity statistics</li>
                <li>Product listing trends</li>
                <li>User engagement analytics</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle>Platform Settings</CardTitle>
              </div>
              <CardDescription>Coming in Phase 6</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Planned features:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Configure marketplace policies</li>
                <li>Manage fee structures</li>
                <li>Set approval workflows</li>
                <li>Customize branding</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
