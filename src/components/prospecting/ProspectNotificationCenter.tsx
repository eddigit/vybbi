import React, { useState } from 'react';
import { Bell, Settings, X, CheckCircle, AlertTriangle, Flame, Clock, Target, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useProspectNotifications, ProspectNotificationData } from '@/hooks/useProspectNotifications';
import { useNavigate } from 'react-router-dom';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'hot_prospect': return <Flame className="h-4 w-4 text-orange-500" />;
    case 'urgent_task': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'inactive_prospect': return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'conversion': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'goal_achieved': return <Target className="h-4 w-4 text-blue-500" />;
    case 'email_response': return <Mail className="h-4 w-4 text-purple-500" />;
    case 'conflict_warning': return <AlertCircle className="h-4 w-4 text-red-600" />;
    default: return <Bell className="h-4 w-4" />;
  }
};

const getPriorityBadgeVariant = (priority: string) => {
  switch (priority) {
    case 'critical': return 'destructive';
    case 'high': return 'default';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'secondary';
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'À l\'instant';
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Il y a ${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `Il y a ${diffInDays}j`;
};

export function ProspectNotificationCenter() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    criticalCount,
    settings,
    saveUserSettings,
    dismissNotification,
    dismissAllNotifications,
    markAsRead,
    checkForNotifications
  } = useProspectNotifications();
  
  const [showSettings, setShowSettings] = useState(false);

  const handleNotificationClick = (notification: ProspectNotificationData) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'hot_prospect':
      case 'inactive_prospect':
        if (notification.prospectId) {
          navigate(`/admin-prospecting?prospect=${notification.prospectId}`);
        }
        break;
      case 'urgent_task':
        navigate('/admin-prospecting?view=tasks');
        break;
      case 'conversion':
      case 'goal_achieved':
        navigate('/admin-prospecting?view=analytics');
        break;
      default:
        navigate('/admin-prospecting');
    }
  };

  const NotificationSettings = () => (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="font-semibold mb-4">Types de notifications</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="hot-prospects" className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Prospects chauds
            </Label>
            <Switch
              id="hot-prospects"
              checked={settings.enableHotProspects}
              onCheckedChange={(checked) => saveUserSettings({ enableHotProspects: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="urgent-tasks" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Tâches urgentes
            </Label>
            <Switch
              id="urgent-tasks"
              checked={settings.enableUrgentTasks}
              onCheckedChange={(checked) => saveUserSettings({ enableUrgentTasks: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="inactive-prospects" className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Prospects inactifs
            </Label>
            <Switch
              id="inactive-prospects"
              checked={settings.enableInactiveProspects}
              onCheckedChange={(checked) => saveUserSettings({ enableInactiveProspects: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="conversions" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Conversions
            </Label>
            <Switch
              id="conversions"
              checked={settings.enableConversions}
              onCheckedChange={(checked) => saveUserSettings({ enableConversions: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Objectifs atteints
            </Label>
            <Switch
              id="goals"
              checked={settings.enableGoalAchieved}
              onCheckedChange={(checked) => saveUserSettings({ enableGoalAchieved: checked })}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-4">Préférences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="browser-notifications">Notifications navigateur</Label>
            <Switch
              id="browser-notifications"
              checked={settings.browserNotifications}
              onCheckedChange={(checked) => saveUserSettings({ browserNotifications: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="sound">Son</Label>
            <Switch
              id="sound"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => saveUserSettings({ soundEnabled: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className={`absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center rounded-full min-w-[20px] ${
                criticalCount > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-primary text-primary-foreground'
              }`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[500px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications CRM
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount}</Badge>
              )}
            </SheetTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={checkForNotifications}
                className="text-xs"
              >
                Actualiser
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {showSettings ? (
          <NotificationSettings />
        ) : (
          <div className="space-y-4 mt-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">Aucune notification</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vous êtes à jour!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {notifications.length} notification{notifications.length > 1 ? 's' : ''}
                  </p>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={dismissAllNotifications}
                      className="text-xs"
                    >
                      Tout effacer
                    </Button>
                  )}
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <Card 
                      key={notification.id}
                      className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
                        notification.priority === 'critical' ? 'border-l-red-500 bg-red-50/50' :
                        notification.priority === 'high' ? 'border-l-orange-500' :
                        notification.priority === 'medium' ? 'border-l-yellow-500' :
                        'border-l-gray-300'
                      } ${!notification.read ? 'bg-accent/20' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`text-sm font-medium truncate ${!notification.read ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </p>
                                <Badge 
                                  variant={getPriorityBadgeVariant(notification.priority)}
                                  className="text-xs"
                                >
                                  {notification.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-50 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}