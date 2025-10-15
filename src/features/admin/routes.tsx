import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';

const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminAds = lazy(() => import('@/pages/AdminAds'));
const AdminAnalyticsHealth = lazy(() => import('@/pages/AdminAnalyticsHealth'));
const AdminCommunication = lazy(() => import('@/pages/AdminCommunication'));
const AdminCoffreFort = lazy(() => import('@/pages/AdminCoffreFort'));
const AdminEmailDiagnostics = lazy(() => import('@/pages/AdminEmailDiagnostics'));
const AdminInfluenceurs = lazy(() => import('@/pages/AdminInfluenceurs'));
const AdminKnowledge = lazy(() => import('@/pages/AdminKnowledge'));
const AdminMockProfiles = lazy(() => import('@/pages/AdminMockProfiles'));
const AdminModeration = lazy(() => import('@/pages/AdminModeration'));
const AdminProspecting = lazy(() => import('@/pages/AdminProspecting'));
const AdminProspectingAnalytics = lazy(() => import('@/pages/AdminProspectingAnalytics'));
const AdminRoadmap = lazy(() => import('@/pages/AdminRoadmap'));
const AdminSEO = lazy(() => import('@/pages/AdminSEO'));
const AdminBusinessIntegrations = lazy(() => import('@/pages/AdminBusinessIntegrations'));
const AdminBetaStats = lazy(() => import('@/pages/AdminBetaStats'));
const SystemTest = lazy(() => import('@/pages/SystemTest'));

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'ads', element: <AdminAds /> },
      { path: 'analytics-health', element: <AdminAnalyticsHealth /> },
      { path: 'communication', element: <AdminCommunication /> },
      { path: 'coffre-fort', element: <AdminCoffreFort /> },
      { path: 'email-diagnostics', element: <AdminEmailDiagnostics /> },
      { path: 'influenceurs', element: <AdminInfluenceurs /> },
      { path: 'knowledge', element: <AdminKnowledge /> },
      { path: 'mock-profiles', element: <AdminMockProfiles /> },
      { path: 'moderation', element: <AdminModeration /> },
      { path: 'prospecting', element: <AdminProspecting /> },
      { path: 'prospecting-analytics', element: <AdminProspectingAnalytics /> },
      { path: 'roadmap', element: <AdminRoadmap /> },
      { path: 'seo', element: <AdminSEO /> },
      { path: 'business-integrations', element: <AdminBusinessIntegrations /> },
      { path: 'beta-stats', element: <AdminBetaStats /> },
      { path: 'system-test', element: <SystemTest /> }
    ]
  }
];
