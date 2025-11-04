import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const Landing = lazy(() => import('@/pages/Landing'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const Technologie = lazy(() => import('@/pages/Technologie'));
const Fondateurs = lazy(() => import('@/pages/Fondateurs'));
const APropos = lazy(() => import('@/pages/APropos'));
const Partenariats = lazy(() => import('@/pages/Partenariats'));
const Parrainage = lazy(() => import('@/pages/Parrainage'));
const Fonctionnalites = lazy(() => import('@/pages/Fonctionnalites'));
const Tarifs = lazy(() => import('@/pages/Tarifs'));
const TarificationSpecifique = lazy(() => import('@/pages/TarificationSpecifique'));
const CentreAide = lazy(() => import('@/pages/CentreAide'));
const Contact = lazy(() => import('@/pages/Contact'));
const Confidentialite = lazy(() => import('@/pages/Confidentialite'));
const Conditions = lazy(() => import('@/pages/Conditions'));
const Cookies = lazy(() => import('@/pages/Cookies'));
const PourArtistes = lazy(() => import('@/pages/PourArtistes'));
const PourAgentsManagers = lazy(() => import('@/pages/PourAgentsManagers'));
const PourLieuxEvenements = lazy(() => import('@/pages/PourLieuxEvenements'));
const Demo = lazy(() => import('@/pages/Demo'));
const AccesComplet = lazy(() => import('@/pages/AccesComplet'));

export const publicRoutes: RouteObject[] = [
  { path: '/landing', element: <Landing /> },
  { path: '/blog', element: <Blog /> },
  { path: '/blog/:slug', element: <BlogPost /> },
  { path: '/technologie', element: <Technologie /> },
  { path: '/fondateurs', element: <Fondateurs /> },
  { path: '/a-propos', element: <APropos /> },
  { path: '/partenariats', element: <Partenariats /> },
  { path: '/parrainage', element: <Parrainage /> },
  { path: '/fonctionnalites', element: <Fonctionnalites /> },
  { path: '/tarifs', element: <Tarifs /> },
  { path: '/tarification-specifique', element: <TarificationSpecifique /> },
  { path: '/centre-aide', element: <CentreAide /> },
  { path: '/contact', element: <Contact /> },
  { path: '/confidentialite', element: <Confidentialite /> },
  { path: '/conditions', element: <Conditions /> },
  { path: '/cookies', element: <Cookies /> },
  { path: '/pour-artistes', element: <PourArtistes /> },
  { path: '/pour-agents-managers', element: <PourAgentsManagers /> },
  { path: '/pour-lieux-evenements', element: <PourLieuxEvenements /> },
  { path: '/demo', element: <Demo /> },
  { path: '/acces-complet', element: <AccesComplet /> }
];
