import { useMutation } from "@tanstack/react-query";
import { sendBookingProposedNotification, sendBookingStatusChangedNotification } from "@/lib/emailService";
import { toast } from "sonner";

interface BookingProposedData {
  venueEmail: string;
  venueName: string;
  eventTitle: string;
  eventDate: string;
  artistName: string;
  proposedFee: string;
  message?: string;
}

interface BookingStatusChangedData {
  artistEmail: string;
  artistName: string;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  status: string;
  message?: string;
}

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'confirmed':
    case 'accepté':
      return '#10b981'; // green
    case 'rejected':
    case 'refusé':
      return '#ef4444'; // red
    case 'pending':
    case 'en attente':
      return '#f59e0b'; // orange
    default:
      return '#6b7280'; // gray
  }
};

export const useBookingNotifications = () => {
  const notifyBookingProposedMutation = useMutation({
    mutationFn: async (data: BookingProposedData) => {
      return await sendBookingProposedNotification(
        data.venueEmail,
        data.venueName,
        data.eventTitle,
        data.eventDate,
        data.artistName,
        data.proposedFee,
        data.message
      );
    },
    onSuccess: () => {
      toast.success("Notification de booking envoyée à la venue");
    },
    onError: (error: any) => {
      console.error("Erreur envoi notification booking:", error);
      toast.error("Erreur lors de l'envoi de la notification");
    }
  });

  const notifyBookingStatusChangedMutation = useMutation({
    mutationFn: async (data: BookingStatusChangedData) => {
      const statusColor = getStatusColor(data.status);
      return await sendBookingStatusChangedNotification(
        data.artistEmail,
        data.artistName,
        data.eventTitle,
        data.eventDate,
        data.venueName,
        data.status,
        statusColor,
        data.message
      );
    },
    onSuccess: () => {
      toast.success("Notification de changement de statut envoyée à l'artiste");
    },
    onError: (error: any) => {
      console.error("Erreur envoi notification statut:", error);
      toast.error("Erreur lors de l'envoi de la notification");
    }
  });

  return {
    notifyBookingProposed: notifyBookingProposedMutation.mutate,
    notifyBookingStatusChanged: notifyBookingStatusChangedMutation.mutate,
    isNotifyingBookingProposed: notifyBookingProposedMutation.isPending,
    isNotifyingStatusChanged: notifyBookingStatusChangedMutation.isPending,
  };
};