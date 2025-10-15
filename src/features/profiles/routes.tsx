import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const ArtistProfile = lazy(() => import('@/pages/ArtistProfile'));
const ArtistProfileBySlug = lazy(() => import('@/pages/ArtistProfileBySlug'));
const ArtistProfileEdit = lazy(() => import('@/pages/ArtistProfileEdit'));
const AgentProfile = lazy(() => import('@/pages/AgentProfile'));
const AgentProfileEdit = lazy(() => import('@/pages/AgentProfileEdit'));
const ManagerProfile = lazy(() => import('@/pages/ManagerProfile'));
const ManagerProfileEdit = lazy(() => import('@/pages/ManagerProfileEdit'));
const VenueProfile = lazy(() => import('@/pages/VenueProfile'));
const VenueProfileBySlug = lazy(() => import('@/pages/VenueProfileBySlug'));
const VenueProfileEdit = lazy(() => import('@/pages/VenueProfileEdit'));
const PartnerProfile = lazy(() => import('@/pages/PartnerProfile'));
const PartnerProfileBySlug = lazy(() => import('@/pages/PartnerProfileBySlug'));
const Profiles = lazy(() => import('@/pages/Profiles'));
const ClaimVenueProfile = lazy(() => import('@/pages/ClaimVenueProfile'));
const ArtistDashboard = lazy(() => import('@/pages/ArtistDashboard'));
const VenueDashboard = lazy(() => import('@/pages/VenueDashboard'));
const PartnerDashboard = lazy(() => import('@/pages/PartnerDashboard'));
const MyArtists = lazy(() => import('@/pages/MyArtists'));

export const profileRoutes: RouteObject[] = [
  { path: '/profiles', element: <Profiles /> },
  { path: '/artist/:id', element: <ArtistProfile /> },
  { path: '/artistes/:slug', element: <ArtistProfileBySlug /> },
  { path: '/artist/:id/edit', element: <ArtistProfileEdit /> },
  { path: '/agent/:id', element: <AgentProfile /> },
  { path: '/agent/:id/edit', element: <AgentProfileEdit /> },
  { path: '/manager/:id', element: <ManagerProfile /> },
  { path: '/manager/:id/edit', element: <ManagerProfileEdit /> },
  { path: '/lieu/:id', element: <VenueProfile /> },
  { path: '/lieux/:slug', element: <VenueProfileBySlug /> },
  { path: '/lieu/:id/edit', element: <VenueProfileEdit /> },
  { path: '/partners/:slug', element: <PartnerProfileBySlug /> },
  { path: '/partner/:id', element: <PartnerProfile /> },
  { path: '/claim-venue-profile', element: <ClaimVenueProfile /> },
  { path: '/artist-dashboard', element: <ArtistDashboard /> },
  { path: '/venue-dashboard', element: <VenueDashboard /> },
  { path: '/partner-dashboard', element: <PartnerDashboard /> },
  { path: '/my-artists', element: <MyArtists /> }
];
