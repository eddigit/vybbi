import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import vybbiLogo from "@/assets/vybbi-wolf-logo.png";
import { VybbiTokenBalance } from "@/components/vybbi/VybbiTokenBalance";
import { cn } from "@/lib/utils";

export function MobileHeader() {
  const { user, hasRole } = useAuth();

  return (
    <header className={cn(
      "border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 pt-safe-top z-40 md:hidden"
    )}>
      <div className="flex h-14 items-center justify-between px-6">
        {/* Logo - Always visible */}
        <Link 
          to={user ? (hasRole('admin') ? "/dashboard" : "/") : "/"} 
          className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
        >
          <img 
            src={vybbiLogo} 
            alt="Vybbi Logo" 
            className="w-7 h-7"
          />
          <span className="font-bold text-lg text-white">Vybbi</span>
        </Link>

        {/* VYBBI Token Balance Widget - Only for authenticated users */}
        {user && (
          <div className="flex items-center h-14 pr-12">
            <VybbiTokenBalance variant="widget" />
          </div>
        )}
      </div>
    </header>
  );
}