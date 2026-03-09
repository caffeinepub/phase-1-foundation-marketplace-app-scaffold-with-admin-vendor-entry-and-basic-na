import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import RequireAdmin from "./components/auth/RequireAdmin";
import RequireAuth from "./components/auth/RequireAuth";
import RequireRoleMode from "./components/auth/RequireRoleMode";
import AppLayout from "./components/layout/AppLayout";
import AdminPlaceholderPage from "./pages/AdminPlaceholderPage";
import CartPage from "./pages/CartPage";
import LandingPage from "./pages/LandingPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import OrdersPage from "./pages/OrdersPage";
import OrganizationDetailPage from "./pages/OrganizationDetailPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import PublicProductsPage from "./pages/PublicProductsPage";
import RoleSelectPage from "./pages/RoleSelectPage";
import UserProfilePage from "./pages/UserProfilePage";
import VendorLayoutPage from "./pages/VendorLayoutPage";
import VendorOrdersPage from "./pages/VendorOrdersPage";
import VendorProductsPage from "./pages/VendorProductsPage";
import VendorProfilePage from "./pages/VendorProfilePage";
import VendorStorefrontPage from "./pages/VendorStorefrontPage";
import VendorsDirectoryPage from "./pages/VendorsDirectoryPage";

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const publicProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products",
  component: PublicProductsPage,
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products/$productId",
  component: ProductDetailPage,
});

const vendorsDirectoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vendors",
  component: VendorsDirectoryPage,
});

const vendorStorefrontRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vendors/$vendorId",
  component: VendorStorefrontPage,
});

const organizationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/organizations",
  component: OrganizationsPage,
});

const organizationDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/organizations/$orgId",
  component: OrganizationDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: OrdersPage,
});

const orderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders/$orderId",
  component: OrderDetailPage,
});

const roleSelectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/select-role",
  component: () => (
    <RequireAuth>
      <RoleSelectPage />
    </RequireAuth>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <RequireAuth>
      <RequireAdmin>
        <AdminPlaceholderPage />
      </RequireAdmin>
    </RequireAuth>
  ),
});

const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => (
    <RequireAuth>
      <UserProfilePage />
    </RequireAuth>
  ),
});

const vendorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vendor",
  component: () => (
    <RequireAuth>
      <RequireRoleMode requiredMode="vendor">
        <Outlet />
      </RequireRoleMode>
    </RequireAuth>
  ),
});

const vendorIndexRoute = createRoute({
  getParentRoute: () => vendorRoute,
  path: "/",
  component: VendorLayoutPage,
});

const vendorProfileRoute = createRoute({
  getParentRoute: () => vendorRoute,
  path: "/profile",
  component: () => (
    <VendorLayoutPage>
      <VendorProfilePage />
    </VendorLayoutPage>
  ),
});

const vendorProductsRoute = createRoute({
  getParentRoute: () => vendorRoute,
  path: "/products",
  component: () => (
    <VendorLayoutPage>
      <VendorProductsPage />
    </VendorLayoutPage>
  ),
});

const vendorOrdersRoute = createRoute({
  getParentRoute: () => vendorRoute,
  path: "/orders",
  component: () => (
    <VendorLayoutPage>
      <VendorOrdersPage />
    </VendorLayoutPage>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  publicProductsRoute,
  productDetailRoute,
  vendorsDirectoryRoute,
  vendorStorefrontRoute,
  organizationsRoute,
  organizationDetailRoute,
  cartRoute,
  ordersRoute,
  orderDetailRoute,
  roleSelectRoute,
  adminRoute,
  userProfileRoute,
  vendorRoute.addChildren([
    vendorIndexRoute,
    vendorProfileRoute,
    vendorProductsRoute,
    vendorOrdersRoute,
  ]),
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
