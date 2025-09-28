import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

interface MobileNotificationBadgeProps {
  className?: string;
  isActive?: boolean;
}

export function MobileNotificationBadge({ className, isActive }: MobileNotificationBadgeProps) {
  const { unreadCount } = useNotifications();

  return (
    <div className={cn("relative", className)}>
      <Bell className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 min-w-[20px] p-0 flex items-center justify-center text-[10px] font-medium"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </div>
  );
}