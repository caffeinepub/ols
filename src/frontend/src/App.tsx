import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import Layout from "./components/Layout";
import { useMobileAuth } from "./hooks/useMobileAuth";
import { CreateListingPage } from "./pages/CreateListingPage";
import EditListingPage from "./pages/EditListingPage";
import { HomePage } from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProfilePage from "./pages/ProfilePage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <Toaster />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

function ProtectedCreateListing() {
  const { isAuthenticated } = useMobileAuth();
  if (!isAuthenticated) {
    window.location.href = "/";
    return null;
  }
  return <CreateListingPage />;
}

const createListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create-listing",
  component: ProtectedCreateListing,
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/listing/$id",
  component: ProductDetailPage,
});

function ProtectedProfile() {
  const { isAuthenticated } = useMobileAuth();
  if (!isAuthenticated) {
    window.location.href = "/";
    return null;
  }
  return <ProfilePage />;
}

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProtectedProfile,
});

function ProtectedEditListing() {
  const { isAuthenticated } = useMobileAuth();
  if (!isAuthenticated) {
    window.location.href = "/";
    return null;
  }
  return <EditListingPage />;
}

const editListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/edit-listing/$id",
  component: ProtectedEditListing,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  createListingRoute,
  productDetailRoute,
  profileRoute,
  editListingRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
