import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Shield } from 'lucide-react';

export const AdminLayout = () => {
  const { user, roles, loading } = useAuth();

  // Wait for auth state to resolve to avoid premature redirects
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user || !roles?.includes('admin')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-warning/30 bg-warning/5 px-4 py-2">
        <div className="container mx-auto flex items-center gap-2">
          <Shield className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium text-foreground">Mode Administrateur</span>
        </div>
      </div>
      <Outlet />
    </div>
  );
};
