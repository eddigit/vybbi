import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Shield } from 'lucide-react';

export const AdminLayout = () => {
  const { user, roles } = useAuth();
  
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
