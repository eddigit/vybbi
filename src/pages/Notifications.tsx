import { useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { AutoTranslate } from "@/components/AutoTranslate";
import { useTranslate } from "@/hooks/useTranslate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationPreferences } from "@/components/NotificationPreferences";
import { Bell, Check, X, Trash2, MessageSquare, User, Calendar, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const { translatedText: pageTitle } = useTranslate("Notifications");
  const { notifications, loading, markAsRead, deleteNotification, unreadCount } = useNotifications();
  const [selectedTab, setSelectedTab] = useState("all");
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_message':
        return <MessageSquare className="h-4 w-4" />;
      case 'agent_request':
      case 'manager_request':
        return <User className="h-4 w-4" />;
      case 'booking_request':
        return <Calendar className="h-4 w-4" />;
      case 'review_received':
        return <Star className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'new_message':
        return 'Message';
      case 'agent_request':
        return 'Demande agent';
      case 'manager_request':
        return 'Demande manager';
      case 'booking_request':
        return 'Demande booking';
      case 'review_received':
        return 'Review reçue';
      default:
        return 'Notification';
    }
  };

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
    if (diffInDays === 1) return 'Hier';
    return `Il y a ${diffInDays} jours`;
  };

  const markAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read_at) {
        markAsRead(notification.id);
      }
    });
  };

  const clearAllNotifications = () => {
    notifications.forEach(notification => {
      deleteNotification(notification.id);
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedTab === "unread") return !notification.read_at;
    if (selectedTab === "messages") return notification.type === 'new_message';
    if (selectedTab === "requests") return ['agent_request', 'manager_request', 'booking_request', 'application_received'].includes(notification.type);
    return true; // "all"
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SEOHead 
          title={pageTitle}
          description="Gérez vos notifications sur Vybbi"
          canonical="/notifications"
        />
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEOHead 
        title={pageTitle}
        description="Gérez vos notifications et préférences sur Vybbi"
        canonical="/notifications"
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            <AutoTranslate text="Notifications" />
          </h1>
          {unreadCount > 0 && (
            <Badge variant="secondary">
              {unreadCount} non lu{unreadCount > 1 ? 'es' : 'e'}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              <AutoTranslate text="Tout marquer lu" />
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllNotifications}>
              <Trash2 className="h-4 w-4 mr-2" />
              <AutoTranslate text="Tout supprimer" />
            </Button>
          )}
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            <AutoTranslate text="Toutes" />
          </TabsTrigger>
          <TabsTrigger value="unread">
            <AutoTranslate text="Non lues" />
            {unreadCount > 0 && (
              <Badge className="ml-1 h-4 w-4 p-0 text-xs">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages">
            <AutoTranslate text="Messages" />
          </TabsTrigger>
          <TabsTrigger value="requests">
            <AutoTranslate text="Demandes" />
          </TabsTrigger>
          <TabsTrigger value="settings">
            <AutoTranslate text="Préférences" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <NotificationsList 
            notifications={filteredNotifications}
            onNotificationClick={handleNotificationClick}
            onMarkRead={markAsRead}
            onDelete={deleteNotification}
            formatTime={formatTime}
            getNotificationIcon={getNotificationIcon}
            getTypeLabel={getTypeLabel}
          />
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          <NotificationsList 
            notifications={filteredNotifications}
            onNotificationClick={handleNotificationClick}
            onMarkRead={markAsRead}
            onDelete={deleteNotification}
            formatTime={formatTime}
            getNotificationIcon={getNotificationIcon}
            getTypeLabel={getTypeLabel}
          />
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <NotificationsList 
            notifications={filteredNotifications}
            onNotificationClick={handleNotificationClick}
            onMarkRead={markAsRead}
            onDelete={deleteNotification}
            formatTime={formatTime}
            getNotificationIcon={getNotificationIcon}
            getTypeLabel={getTypeLabel}
          />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <NotificationsList 
            notifications={filteredNotifications}
            onNotificationClick={handleNotificationClick}
            onMarkRead={markAsRead}
            onDelete={deleteNotification}
            formatTime={formatTime}
            getNotificationIcon={getNotificationIcon}
            getTypeLabel={getTypeLabel}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <AutoTranslate text="Préférences de notification" />
              </CardTitle>
              <CardDescription>
                <AutoTranslate text="Configurez comment et quand vous souhaitez recevoir des notifications." />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationPreferences />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface NotificationsListProps {
  notifications: any[];
  onNotificationClick: (notification: any) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  formatTime: (date: string) => string;
  getNotificationIcon: (type: string) => JSX.Element;
  getTypeLabel: (type: string) => string;
}

function NotificationsList({
  notifications,
  onNotificationClick,
  onMarkRead,
  onDelete,
  formatTime,
  getNotificationIcon,
  getTypeLabel
}: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">
            <AutoTranslate text="Aucune notification" />
          </h3>
          <p className="text-muted-foreground">
            <AutoTranslate text="Vous êtes à jour ! Aucune notification à afficher." />
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={`cursor-pointer transition-colors hover:bg-accent/50 ${
            !notification.read_at ? 'border-primary/20 bg-primary/5' : ''
          }`}
          onClick={() => onNotificationClick(notification)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium text-sm ${
                      !notification.read_at ? 'font-semibold' : ''
                    }`}>
                      {notification.title}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(notification.type)}
                    </Badge>
                    {!notification.read_at && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {notification.message}
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    {formatTime(notification.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 ml-4">
                {!notification.read_at && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(notification.id);
                    }}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}