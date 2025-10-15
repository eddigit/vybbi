import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const EventsManager = lazy(() => import('@/pages/EventsManager'));
const AnnonceManager = lazy(() => import('@/pages/AnnonceManager'));
const AnnoncesWall = lazy(() => import('@/pages/AnnoncesWall'));
const PublierOffre = lazy(() => import('@/pages/PublierOffre'));

export const eventRoutes: RouteObject[] = [
  { path: '/events', element: <EventsManager /> },
  { path: '/annonce-manager', element: <AnnonceManager /> },
  { path: '/annonces', element: <AnnoncesWall /> },
  { path: '/publier-offre', element: <PublierOffre /> }
];
