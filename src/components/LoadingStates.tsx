import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Profile loading skeleton
export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6">
        <Skeleton className="w-32 h-32 rounded-full mx-auto sm:mx-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-14" />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// Event card loading skeleton
export function EventCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Skeleton className="w-12 h-12 rounded" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Artist card loading skeleton
export function ArtistCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Message list loading skeleton
export function MessageListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={cn('flex gap-3', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
          {i % 2 === 0 && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />}
          <div className={cn('space-y-1', i % 2 === 0 ? 'items-start' : 'items-end')}>
            <Skeleton className={cn('h-10 rounded-lg', i % 2 === 0 ? 'w-48' : 'w-32')} />
            <Skeleton className="h-3 w-16" />
          </div>
          {i % 2 === 1 && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />}
        </div>
      ))}
    </div>
  );
}

// Table loading skeleton
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full">
      <div className="flex border-b">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1 p-4">
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex border-b">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="flex-1 p-4">
              <Skeleton className={cn('h-4', j === 0 ? 'w-32' : 'w-16')} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Full page loading
export function PageLoader({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

// Inline loader
export function InlineLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-4', className)}>
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );
}