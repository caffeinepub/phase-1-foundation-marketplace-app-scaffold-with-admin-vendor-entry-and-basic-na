import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import LandingPage from './pages/LandingPage';
import PublicProductsPage from './pages/PublicProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import VendorsDirectoryPage from './pages/VendorsDirectoryPage';
import VendorStorefrontPage from './pages/VendorStorefrontPage';
import AdminPlaceholderPage from './pages/AdminPlaceholderPage';
import VendorLayoutPage from './pages/VendorLayoutPage';
import VendorProfilePage from './pages/VendorProfilePage';
import VendorProductsPage from './pages/VendorProductsPage';
import RoleSelectPage from './pages/RoleSelectPage';
import AppLayout from './components/layout/AppLayout';
import RequireAuth from './components/auth/RequireAuth';
import RequireRoleMode from './components/auth/RequireRoleMode';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const publicProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: PublicProductsPage,
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/$productId',
  component: ProductDetailPage,
});

const vendorsDirectoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vendors',
  component: VendorsDirectoryPage,
});

const vendorStorefrontRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vendors/$vendorId',
  component: VendorStorefrontPage,
});

const roleSelectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/select-role',
  component: () => (
    <RequireAuth>
      <RoleSelectPage />
    </RequireAuth>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <RequireAuth>
      <RequireRoleMode requiredMode="admin">
        <AdminPlaceholderPage />
      </RequireRoleMode>
    </RequireAuth>
  ),
});

const vendorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vendor',
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
  path: '/',
  component: VendorLayoutPage,
});

const vendorProfileRoute = createRoute({
  getParentRoute: () => vendorRoute,
  path: '/profile',
  component: () => (
    <VendorLayoutPage>
      <VendorProfilePage />
    </VendorLayoutPage>
  ),
});

const vendorProductsRoute = createRoute({
  getParentRoute: () => vendorRoute,
  path: '/products',
  component: () => (
    <VendorLayoutPage>
      <VendorProductsPage />
    </VendorLayoutPage>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  publicProductsRoute,
  productDetailRoute,
  vendorsDirectoryRoute,
  vendorStorefrontRoute,
  roleSelectRoute,
  adminRoute,
  vendorRoute.addChildren([vendorIndexRoute, vendorProfileRoute, vendorProductsRoute]),
]);

const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
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
