import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const GetStarted = lazy(() => import('@/pages/GetStarted'));
const AccountSetup = lazy(() => import('@/pages/AccountSetup'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const InscriptionConfirmation = lazy(() => import('@/pages/InscriptionConfirmation'));
const InscriptionInfluenceur = lazy(() => import('@/pages/InscriptionInfluenceur'));

export const onboardingRoutes: RouteObject[] = [
  { path: '/get-started', element: <GetStarted /> },
  { path: '/account-setup', element: <AccountSetup /> },
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/inscription-confirmation', element: <InscriptionConfirmation /> },
  { path: '/inscription-influenceur', element: <InscriptionInfluenceur /> }
];
