import { useState } from "react";
import { Bell, Check, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { AutoTranslate } from "@/components/AutoTranslate";
import { useNotifications } from "@/hooks/useNotifications";
import { Link, useNavigate } from "react-router-dom";

export function NotificationCenter() {
  const { notifications, loading, unreadCount, markAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    // Handle navigation based on notification type
    if (notification.type === 'new_message' && notification.data?.conversation_id) {
      navigate('/messages', { state: { selectedConversationId: notification.data.conversation_id } });
    } else if (notification.type === 'booking_request' && notification.data?.booking_id) {
      navigate('/bookings');
    } else if (notification.type === 'agent_request' || notification.type === 'manager_request') {
      navigate('/dashboard');
    } else if (notification.type === 'application_received') {
      navigate('/annonces-manager');
    } else if (notification.type === 'review_received') {
      navigate('/dashboard');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  const markAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read_at) {
        markAsRead(notification.id);
      }
    });
  };

  if (loading) {
    return (
      <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10" disabled>
        <Bell className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 text-xs bg-primary text-primary-foreground flex items-center justify-center rounded-full min-w-[16px] sm:min-w-[20px]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 sm:w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-3">
          <DropdownMenuLabel className="text-sm p-0">
            <AutoTranslate text="Notifications" />
          </DropdownMenuLabel>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs h-6 px-2"
              >
                <Check className="h-3 w-3 mr-1" />
                <AutoTranslate text="Tout lire" />
              </Button>
            )}
            <Link to="/settings/notifications">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Settings className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>
            <div className="flex flex-col items-center py-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <AutoTranslate text="Aucune notification" />
            </div>
          </DropdownMenuItem>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent relative group"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={`flex items-center gap-2 w-full ${!notification.read_at ? 'font-semibold' : ''}`}>
                  <span className="text-sm flex-1 truncate">{notification.title}</span>
                  {!notification.read_at && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</span>
                <span className="text-xs text-muted-foreground mt-1">{formatTime(notification.created_at)}</span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/notifications" className="w-full text-center">
            <AutoTranslate text="Voir toutes les notifications" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}