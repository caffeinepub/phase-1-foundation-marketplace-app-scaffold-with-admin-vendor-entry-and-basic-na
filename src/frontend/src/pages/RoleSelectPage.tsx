import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, User } from 'lucide-react';
import { useRoleMode } from '../hooks/useRoleMode';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function RoleSelectPage() {
  const { setRoleMode } = useRoleMode();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

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
          <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => handleRoleSelect('admin')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Admin</CardTitle>
              <CardDescription>
                Manage the marketplace, vendors, and platform settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" onClick={() => handleRoleSelect('admin')}>
                Continue as Admin
              </Button>
              <div className="mt-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium">Admin capabilities:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Vendor approval and management</li>
                  <li>Platform configuration</li>
                  <li>Analytics and reporting</li>
                </ul>
              </div>
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
