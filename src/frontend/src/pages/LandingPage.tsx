import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Database,
  KeyRound,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  UserCheck,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: KeyRound,
    title: "Secure Auth",
    description:
      "Internet Identity login — no passwords, no email, fully self-sovereign.",
  },
  {
    icon: Store,
    title: "Vendor Storefronts",
    description:
      "Vendors create profiles, manage listings, and build their own branded storefront.",
  },
  {
    icon: ShoppingCart,
    title: "Cart & Orders",
    description:
      "Buyers browse products, add to cart, place orders, and track fulfillment.",
  },
  {
    icon: LayoutDashboard,
    title: "Admin Dashboard",
    description:
      "Verify vendors, manage admins, view all orders, and control platform settings.",
  },
  {
    icon: Building2,
    title: "Organizations",
    description:
      "Group vendors into organizations for structured multi-org operations.",
  },
  {
    icon: Database,
    title: "On-Chain Storage",
    description:
      "All data persisted in stable canister memory on ICP — survives every upgrade.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: KeyRound,
    title: "Sign In",
    description:
      "Authenticate with Internet Identity — one click, no passwords, fully decentralized.",
  },
  {
    step: "02",
    icon: UserCheck,
    title: "Choose Your Role",
    description:
      "Browse as a buyer, manage listings as a vendor, or administer the platform.",
  },
  {
    step: "03",
    icon: Zap,
    title: "Transact",
    description:
      "Browse products, place orders, list your own products for sale, and manage everything on-chain.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-background">
        {/* Atmospheric mesh background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 60% -10%, oklch(0.45 0.15 145 / 0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 0% 80%, oklch(0.45 0.15 145 / 0.07) 0%, transparent 60%)",
          }}
        />
        {/* Decorative grid lines */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.2 0.02 60) 1px, transparent 1px), linear-gradient(90deg, oklch(0.2 0.02 60) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex justify-center">
              <Badge
                variant="secondary"
                className="gap-2 px-4 py-1.5 text-sm font-medium rounded-full border border-primary/20 bg-primary/5 text-primary"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Live on the Internet Computer
              </Badge>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-foreground">
              A Multi-Vendor
              <br />
              <span className="text-primary">Marketplace</span> on ICP
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Vendors sell, buyers browse and order, admins manage — all
              on-chain on the Internet Computer with no central servers and no
              data loss across upgrades.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button size="lg" asChild className="gap-2 px-8 h-12 text-base">
                <Link to="/products" data-ocid="landing.browse_products.button">
                  <Package className="h-5 w-5" />
                  Browse Products
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="gap-2 px-8 h-12 text-base"
              >
                <Link to="/vendors" data-ocid="landing.explore_vendors.button">
                  <Store className="h-5 w-5" />
                  Explore Vendors
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                asChild
                className="gap-2 px-8 h-12 text-base"
              >
                <Link to="/select-role" data-ocid="landing.get_started.button">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Separator />
      </section>

      {/* ── Feature highlights ────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20 md:py-24">
        <div className="text-center space-y-4 mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Everything a marketplace needs
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg">
            Built end-to-end on the Internet Computer — from auth to order
            management to on-chain persistence.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                data-ocid={`landing.feature.card.${i + 1}`}
                className="group relative overflow-hidden border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-md"
              >
                {/* Subtle hover glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                <CardHeader className="pb-3">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* ── How It Works ──────────────────────────────────────────── */}
      <section className="bg-muted/30 py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg">
              Three steps from sign-in to transacting on the decentralized
              marketplace.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Connecting line (desktop) */}
            <div
              aria-hidden
              className="hidden lg:block absolute top-10 left-[calc(16.66%+1.25rem)] right-[calc(16.66%+1.25rem)] h-px bg-gradient-to-r from-transparent via-border to-transparent"
            />

            <div className="grid md:grid-cols-3 gap-8 md:gap-10">
              {HOW_IT_WORKS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.step}
                    data-ocid={`landing.how_it_works.item.${i + 1}`}
                    className="relative flex flex-col items-center text-center space-y-4"
                  >
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-card border border-border shadow-sm">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold font-display">
                        {step.step.replace("0", "")}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display text-lg font-semibold">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-16 text-center">
            <Button size="lg" asChild className="gap-2 px-10 h-12 text-base">
              <Link
                to="/select-role"
                data-ocid="landing.how_it_works.get_started.button"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────── */}
      <section className="border-y border-border bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "100%", label: "On-chain storage" },
              { value: "0", label: "Passwords required" },
              { value: "Multi-role", label: "Vendor · Buyer · Admin" },
              { value: "ICP", label: "Internet Computer Protocol" },
            ].map((stat) => (
              <div
                key={stat.value}
                className="flex flex-col items-center text-center space-y-1"
              >
                <span className="font-display text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </span>
                <span className="text-xs md:text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-muted/20 border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Built with love using caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
