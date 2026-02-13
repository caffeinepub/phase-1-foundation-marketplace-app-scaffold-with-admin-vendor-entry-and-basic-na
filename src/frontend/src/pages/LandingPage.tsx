import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Package, Shield, User, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center py-16 space-y-6">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Store className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight">
          Welcome to Marketplace Foundation
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Phase 1: Building the foundation for a multi-vendor marketplace on the Internet Computer
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button size="lg" asChild>
            <Link to="/products">
              <Package className="h-5 w-5 mr-2" />
              Browse Products
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/select-role">
              Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Phase 1 Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Internet Identity</CardTitle>
              <CardDescription>
                Secure authentication using Internet Identity for all users
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                <User className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Role Selection</CardTitle>
              <CardDescription>
                Choose between Admin and Vendor modes after signing in
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Product Listings</CardTitle>
              <CardDescription>
                Public product browsing interface (placeholder for Phase 2)
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Marketplace Shell</CardTitle>
              <CardDescription>
                Complete navigation and layout foundation for future phases
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="py-16">
        <Card className="bg-accent/50">
          <CardHeader>
            <CardTitle className="text-2xl">What's Coming Next?</CardTitle>
            <CardDescription className="text-base">
              Future phases will introduce powerful marketplace capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Phase 2: Data & Onboarding</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Vendor registration and profiles</li>
                  <li>• Product creation and management</li>
                  <li>• Basic CRUD operations</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Phase 3+: Advanced Features</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Search and filtering</li>
                  <li>• Analytics dashboards</li>
                  <li>• Multi-organization support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
