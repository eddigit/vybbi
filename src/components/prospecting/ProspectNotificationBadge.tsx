import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Flame, AlertTriangle, Clock } from 'lucide-react';
import { useProspectNotifications } from '@/hooks/useProspectNotifications';

interface ProspectNotificationBadgeProps {
  className?: string;
}

export function ProspectNotificationBadge({ className }: ProspectNotificationBadgeProps) {
  const { unreadCount, criticalCount, notifications } = useProspectNotifications();

  if (unreadCount === 0) return null;

  // Get the most critical notification type
  const criticalNotifications = notifications.filter(n => n.priority === 'critical' && !n.read);
  const hotProspects = notifications.filter(n => n.type === 'hot_prospect' && !n.read);
  const urgentTasks = notifications.filter(n => n.type === 'urgent_task' && !n.read);

  const getIcon = () => {
    if (criticalNotifications.length > 0) return <AlertTriangle className="h-3 w-3" />;
    if (hotProspects.length > 0) return <Flame className="h-3 w-3" />;
    if (urgentTasks.length > 0) return <Clock className="h-3 w-3" />;
    return <Bell className="h-3 w-3" />;
  };

  const getVariant = () => {
    if (criticalNotifications.length > 0) return 'destructive';
    if (hotProspects.length > 0) return 'default';
    return 'secondary';
  };

  const getMessage = () => {
    if (criticalNotifications.length > 0) return `${criticalNotifications.length} critique${criticalNotifications.length > 1 ? 's' : ''}`;
    if (hotProspects.length > 0) return `${hotProspects.length} prospect${hotProspects.length > 1 ? 's' : ''} chaud${hotProspects.length > 1 ? 's' : ''}`;
    if (urgentTasks.length > 0) return `${urgentTasks.length} tâche${urgentTasks.length > 1 ? 's' : ''} urgente${urgentTasks.length > 1 ? 's' : ''}`;
    return `${unreadCount} notification${unreadCount > 1 ? 's' : ''}`;
  };

  return (
    <Badge 
      variant={getVariant()} 
      className={`animate-pulse ${className}`}
    >
      {getIcon()}
      <span className="ml-1 text-xs">
        {getMessage()}
      </span>
    </Badge>
  );
}