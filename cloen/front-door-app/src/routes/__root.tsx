import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "../components/ui/sonner";
import { GlobalCursor } from "../components/global-cursor";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      {
        name: "description",
        content:
          "Opulent Canvas creates premium, visually stunning digital experiences with customizable themes.",
      },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      {
        property: "og:description",
        content:
          "Opulent Canvas creates premium, visually stunning digital experiences with customizable themes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable App" },
      {
        name: "twitter:description",
        content:
          "Opulent Canvas creates premium, visually stunning digital experiences with customizable themes.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7f4ff771-3c6e-4968-8fe6-c6c258433fd6/id-preview-3be66d89--d2c67688-ee6a-45f9-8e08-87d0d0775a52.lovable.app-1780508672083.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7f4ff771-3c6e-4968-8fe6-c6c258433fd6/id-preview-3be66d89--d2c67688-ee6a-45f9-8e08-87d0d0775a52.lovable.app-1780508672083.png",
      },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalCursor />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4500}
        theme="dark"
        toastOptions={{
          classNames: {
            toast:
              "!bg-[oklch(0.14_0.018_285)] !border-[oklch(0.88_0.018_95/0.2)] !text-[oklch(0.96_0.012_95)] !shadow-[0_8px_32px_-8px_oklch(0_0_0/0.6)] font-[var(--font-display)]",
            title: "!font-semibold !text-[oklch(0.96_0.012_95)]",
            description: "!text-[oklch(0.65_0.01_285)]",
            success: "!border-[oklch(0.78_0.18_155/0.35)]",
            error: "!border-[oklch(0.72_0.20_22/0.4)]",
            warning: "!border-[oklch(0.82_0.16_70/0.4)]",
            actionButton:
              "!bg-gradient-to-r !from-[oklch(0.88_0.018_95)] !to-[oklch(0.78_0.12_75)] !text-[oklch(0.14_0.018_285)] !font-semibold",
            cancelButton: "!bg-[oklch(0.20_0.015_285)] !text-[oklch(0.65_0.01_285)]",
            closeButton:
              "!bg-[oklch(0.20_0.015_285)] !border-[oklch(0.88_0.018_95/0.15)] !text-[oklch(0.65_0.01_285)] hover:!text-[oklch(0.96_0.012_95)]",
          },
        }}
      />
    </QueryClientProvider>
  );
}
