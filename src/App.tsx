import { Suspense } from 'react';
import { TranslationProvider } from "@/contexts/I18nProvider";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, useRoutes, useLocation, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { RadioPlayer } from "@/components/RadioPlayer";
import { PerformanceOptimizer, ConnectionOptimizer } from './components/PerformanceOptimizer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { PWAUpdateHandler } from '@/components/PWAUpdateHandler';
import { RealtimeNotificationProvider } from '@/components/RealtimeNotificationProvider';
import { SuspenseLoader } from '@/components/common/SuspenseLoader';
import { useIsMobile } from "@/hooks/use-mobile";
import { useRadioPlayerVisibility } from "@/hooks/useRadioPlayerVisibility";

// Import route configurations
import { authRoutes } from '@/features/auth/routes';
import { adminRoutes } from '@/features/admin/routes';
import { profileRoutes } from '@/features/profiles/routes';
import { dashboardRoutes } from '@/features/dashboard/routes';
import { socialRoutes } from '@/features/social/routes';
import { publicRoutes } from '@/features/public-pages/routes';
import { discoveryRoutes } from '@/features/discovery/routes';
import { eventRoutes } from '@/features/events/routes';
import { mediaRoutes } from '@/features/media/routes';
import { onboardingRoutes } from '@/features/onboarding/routes';
import { influencerRoutes } from '@/features/influencer/routes';
import { partnerRoutes } from '@/features/partners/routes';
import { tokenRoutes } from '@/features/token/routes';

// Lazy load special components
const ConditionalHomePage = lazy(() => import('@/components/ConditionalHomePage').then(m => ({ default: m.ConditionalHomePage })));
const NotFound = lazy(() => import('./pages/NotFound'));
const LegacyProfileRedirect = lazy(() => import('./pages/LegacyProfileRedirect'));

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: { retry: 1 },
  },
});

const AuthHashRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!location.hash) return;
    const hash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
    const params = new URLSearchParams(hash);
    const hasAuthParams = params.has('error') || params.has('error_code') || params.has('access_token') || params.has('refresh_token') || params.has('code') || params.has('token') || params.has('token_hash') || params.has('type');
    if (hasAuthParams && location.pathname !== '/auth/callback') {
      navigate({ pathname: '/auth/callback', search: location.search, hash: location.hash }, { replace: true });
    }
  }, [location, navigate]);
  return null;
};

const ConditionalRadioPlayer = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { isRadioVisible } = useRadioPlayerVisibility();
  
  const shouldShowPlayer = !isMobile || location.pathname === '/radio' || (isMobile && isRadioVisible);
  
  return shouldShowPlayer ? <RadioPlayer /> : null;
};

const AppRoutes = () => {
  const routes = useRoutes([
    { path: '/', element: <ConditionalHomePage /> },
    ...authRoutes,
    ...adminRoutes,
    ...profileRoutes,
    ...dashboardRoutes,
    ...socialRoutes,
    ...publicRoutes,
    ...discoveryRoutes,
    ...eventRoutes,
    ...mediaRoutes,
    ...onboardingRoutes,
    ...influencerRoutes,
    ...partnerRoutes,
    ...tokenRoutes,
    // Legacy redirects
    { path: '/artists/:id', element: <LegacyProfileRedirect /> },
    { path: '/lieux/:id', element: <LegacyProfileRedirect /> },
    { path: '/partners/:id', element: <LegacyProfileRedirect /> },
    { path: '/agents/:id', element: <LegacyProfileRedirect /> },
    { path: '/managers/:id', element: <LegacyProfileRedirect /> },
    // 404
    { path: '*', element: <NotFound /> }
  ]);

  return <Suspense fallback={<SuspenseLoader />}>{routes}</Suspense>;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TranslationProvider>
          <ConnectionOptimizer>
            <PerformanceOptimizer>
              <TooltipProvider>
                <Sonner />
                <BrowserRouter>
                  <RealtimeNotificationProvider>
                    <AuthHashRedirect />
                    <ScrollToTop />
                    <Layout>
                      <AppRoutes />
                    </Layout>
                    <ConditionalRadioPlayer />
                    <PWAInstallPrompt />
                    <OfflineIndicator />
                    <PWAUpdateHandler />
                  </RealtimeNotificationProvider>
                </BrowserRouter>
              </TooltipProvider>
            </PerformanceOptimizer>
          </ConnectionOptimizer>
        </TranslationProvider>
      </HelmetProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
