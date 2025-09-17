import React, { Suspense, lazy } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load analytics components
const EnhancedProfileAnalytics = lazy(() => import('./EnhancedProfileAnalytics'));
const ProfileEmbedWidget = lazy(() => import('./ProfileEmbedWidget'));

interface LazyLoadAnalyticsProps {
  profileId: string;
  profileType: string;
  profileSlug: string;
  isOwner: boolean;
}

const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <Card className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    </Card>
    <Card className="p-6">
      <Skeleton className="h-[300px]" />
    </Card>
  </div>
);

const EmbedSkeleton = () => (
  <Card className="p-6">
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-32" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  </Card>
);

export const LazyLoadAnalytics: React.FC<LazyLoadAnalyticsProps> = ({
  profileId,
  profileType,
  profileSlug,
  isOwner
}) => {
  if (!isOwner) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <Suspense fallback={<AnalyticsSkeleton />}>
        <EnhancedProfileAnalytics 
          profileId={profileId}
          className="transition-all duration-300 hover:shadow-md"
        />
      </Suspense>
      
      <Suspense fallback={<EmbedSkeleton />}>
        <ProfileEmbedWidget
          profileId={profileId}
          profileType={profileType}
          profileSlug={profileSlug}
          className="transition-all duration-300 hover:shadow-md"
        />
      </Suspense>
    </div>
  );
};