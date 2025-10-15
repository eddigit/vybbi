import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const TrouverArtiste = lazy(() => import('@/pages/TrouverArtiste'));
const TrouverAgent = lazy(() => import('@/pages/TrouverAgent'));
const TrouverLieu = lazy(() => import('@/pages/TrouverLieu'));
const Artists = lazy(() => import('@/pages/Artists'));
const Lieux = lazy(() => import('@/pages/Lieux'));
const TopArtistes = lazy(() => import('@/pages/TopArtistes'));
const RechercheAvancee = lazy(() => import('@/pages/RechercheAvancee'));
const NosArtistes = lazy(() => import('@/pages/NosArtistes'));
const Partners = lazy(() => import('@/pages/Partners'));

export const discoveryRoutes: RouteObject[] = [
  { path: '/trouver-artiste', element: <TrouverArtiste /> },
  { path: '/trouver-agent', element: <TrouverAgent /> },
  { path: '/trouver-lieu', element: <TrouverLieu /> },
  { path: '/artists', element: <Artists /> },
  { path: '/artistes', element: <Artists /> },
  { path: '/lieux', element: <Lieux /> },
  { path: '/top-artistes', element: <TopArtistes /> },
  { path: '/recherche-avancee', element: <RechercheAvancee /> },
  { path: '/nos-artistes', element: <NosArtistes /> },
  { path: '/partners', element: <Partners /> }
];
