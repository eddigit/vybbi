import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProspects } from './useProspects';
import { useConversions } from './useConversions';
import { showNotification, requestNotificationPermission } from '@/utils/notificationPermissions';
import { useToast } from './use-toast';

export interface ProspectNotificationData {
  id: string;
  title: string;
  message: string;
  type: 'hot_prospect' | 'urgent_task' | 'inactive_prospect' | 'conversion' | 'goal_achieved' | 'email_response' | 'conflict_warning';
  priority: 'low' | 'medium' | 'high' | 'critical';
  prospectId?: string;
  taskId?: string;
  conversionId?: string;
  metadata?: any;
  createdAt: string;
  read?: boolean;
}

export interface ProspectNotificationSettings {
  enableHotProspects: boolean;
  enableUrgentTasks: boolean;
  enableInactiveProspects: boolean;
  enableConversions: boolean;
  enableGoalAchieved: boolean;
  enableEmailResponses: boolean;
  enableConflictWarnings: boolean;
  soundEnabled: boolean;
  browserNotifications: boolean;
  inactiveProspectDays: number;
  urgentTaskHours: number;
  hotProspectScore: number;
}

const DEFAULT_SETTINGS: ProspectNotificationSettings = {
  enableHotProspects: true,
  enableUrgentTasks: true,
  enableInactiveProspects: true,
  enableConversions: true,
  enableGoalAchieved: true,
  enableEmailResponses: true,
  enableConflictWarnings: true,
  soundEnabled: false,
  browserNotifications: true,
  inactiveProspectDays: 7,
  urgentTaskHours: 2,
  hotProspectScore: 80
};

export function useProspectNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { prospects } = useProspects();
  const { conversions } = useConversions();
  const [notifications, setNotifications] = useState<ProspectNotificationData[]>([]);
  const [settings, setSettings] = useState<ProspectNotificationSettings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize notifications and request permissions
  useEffect(() => {
    if (!user || isInitialized) return;

    const initializeNotifications = async () => {
      console.log('🔔 [ProspectNotifications] Initializing for user:', user.id);
      
      // Request browser notification permission
      if (settings.browserNotifications) {
        const granted = await requestNotificationPermission();
        console.log('🔔 [ProspectNotifications] Browser permission:', granted);
      }

      // Load user preferences
      loadUserSettings();
      
      // Check for immediate notifications
      checkForNotifications();
      
      setIsInitialized(true);
    };

    initializeNotifications();
  }, [user, isInitialized]);

  // Monitor prospects for hot prospects and inactive ones
  useEffect(() => {
    if (!prospects.length || !settings.enableHotProspects && !settings.enableInactiveProspects) return;

    checkProspectNotifications();
  }, [prospects, settings]);

  const loadUserSettings = async () => {
    // In a real app, load from user preferences table
    // For now, use localStorage
    const saved = localStorage.getItem(`prospect-notifications-${user?.id}`);
    if (saved) {
      setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    }
  };

  const saveUserSettings = (newSettings: Partial<ProspectNotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem(`prospect-notifications-${user?.id}`, JSON.stringify(updatedSettings));
  };

  const checkProspectNotifications = () => {
    const now = new Date();
    const newNotifications: ProspectNotificationData[] = [];

    prospects.forEach(prospect => {
      // Hot prospect detection
      if (settings.enableHotProspects && prospect.qualification_score >= settings.hotProspectScore) {
        const hotNotification: ProspectNotificationData = {
          id: `hot-${prospect.id}`,
          title: '🔥 Prospect Chaud Détecté!',
          message: `${prospect.contact_name} (${prospect.qualification_score}%) est très qualifié`,
          type: 'hot_prospect',
          priority: 'high',
          prospectId: prospect.id,
          metadata: { score: prospect.qualification_score, company: prospect.prospect_type },
          createdAt: new Date().toISOString()
        };
        
        if (!notifications.find(n => n.id === hotNotification.id)) {
          newNotifications.push(hotNotification);
        }
      }

      // Inactive prospect detection
      if (settings.enableInactiveProspects && prospect.last_contact_at) {
        const lastContact = new Date(prospect.last_contact_at);
        const daysSinceContact = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceContact >= settings.inactiveProspectDays) {
          const inactiveNotification: ProspectNotificationData = {
            id: `inactive-${prospect.id}`,
            title: '⏰ Prospect Inactif',
            message: `${prospect.contact_name} - Pas de contact depuis ${daysSinceContact} jours`,
            type: 'inactive_prospect',
            priority: daysSinceContact > 14 ? 'high' : 'medium',
            prospectId: prospect.id,
            metadata: { daysSinceContact, lastContactDate: prospect.last_contact_at },
            createdAt: new Date().toISOString()
          };
          
          if (!notifications.find(n => n.id === inactiveNotification.id)) {
            newNotifications.push(inactiveNotification);
          }
        }
      }
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev]);
      newNotifications.forEach(notification => {
        showProspectNotification(notification);
      });
    }
  };

  const checkForNotifications = () => {
    // Check for urgent tasks (mock data for demo)
    if (settings.enableUrgentTasks) {
      const urgentTasks = [
        {
          id: 'task-1',
          title: 'Appeler Jean Dupont',
          deadline: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
          prospectId: 'prospect-1'
        }
      ];

      urgentTasks.forEach(task => {
        const hoursUntilDeadline = Math.floor((task.deadline.getTime() - Date.now()) / (1000 * 60 * 60));
        
        if (hoursUntilDeadline <= settings.urgentTaskHours) {
          const urgentNotification: ProspectNotificationData = {
            id: `urgent-${task.id}`,
            title: '⚡ Tâche Urgente!',
            message: `"${task.title}" dans ${hoursUntilDeadline}h`,
            type: 'urgent_task',
            priority: 'critical',
            taskId: task.id,
            prospectId: task.prospectId,
            metadata: { taskTitle: task.title, deadline: task.deadline },
            createdAt: new Date().toISOString()
          };

          if (!notifications.find(n => n.id === urgentNotification.id)) {
            setNotifications(prev => [urgentNotification, ...prev]);
            showProspectNotification(urgentNotification);
          }
        }
      });
    }
  };

  const showProspectNotification = (notification: ProspectNotificationData) => {
    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      duration: notification.priority === 'critical' ? 8000 : 5000,
      variant: notification.priority === 'critical' ? 'destructive' : 'default'
    });

    // Show browser notification if enabled
    if (settings.browserNotifications) {
      showNotification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: `prospect-${notification.type}-${notification.id}`,
        requireInteraction: notification.priority === 'critical',
        data: {
          notificationId: notification.id,
          type: notification.type,
          prospectId: notification.prospectId,
          taskId: notification.taskId,
          priority: notification.priority,
          ...notification.metadata
        }
      });
    }
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const dismissAllNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  // Simulate goal achievement
  const checkGoalAchievement = () => {
    if (!settings.enableGoalAchieved || !conversions.length) return;

    // Check if monthly conversion goal is reached (example: 10 conversions)
    const monthlyGoal = 10;
    const monthlyConversions = conversions.filter(c => {
      const conversionDate = new Date(c.created_at);
      const now = new Date();
      return conversionDate.getMonth() === now.getMonth() && conversionDate.getFullYear() === now.getFullYear();
    }).length;

    if (monthlyConversions >= monthlyGoal) {
      const goalNotification: ProspectNotificationData = {
        id: `goal-monthly-${Date.now()}`,
        title: '🎯 Objectif Atteint!',
        message: `Félicitations! ${monthlyConversions} conversions ce mois`,
        type: 'goal_achieved',
        priority: 'high',
        metadata: { 
          goalType: 'monthly_conversions', 
          achieved: monthlyConversions, 
          target: monthlyGoal 
        },
        createdAt: new Date().toISOString()
      };

      if (!notifications.find(n => n.id === goalNotification.id)) {
        setNotifications(prev => [goalNotification, ...prev]);
        showProspectNotification(goalNotification);
      }
    }
  };

  // Check goals when conversions change
  useEffect(() => {
    if (conversions.length > 0) {
      checkGoalAchievement();
    }
  }, [conversions, settings.enableGoalAchieved]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.read).length;

  return {
    notifications,
    unreadCount,
    criticalCount,
    settings,
    saveUserSettings,
    dismissNotification,
    dismissAllNotifications,
    markAsRead,
    checkForNotifications: () => {
      checkForNotifications();
      checkProspectNotifications();
    }
  };
}