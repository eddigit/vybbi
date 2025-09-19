import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Phone, Video, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Prospect {
  id: string;
  contact_name: string;
  email: string;
  phone?: string;
  company_name?: string;
}

interface BookingSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProspect: Prospect | null;
  onBookingScheduled?: (booking: any) => void;
}

interface BookingData {
  meeting_type: 'call' | 'video' | 'in_person';
  date: string;
  time: string;
  duration: number;
  agenda: string;
  location?: string;
  notes?: string;
}

const MEETING_TYPES = [
  { value: 'video', label: 'Visioconférence', icon: Video, description: 'Rendez-vous en ligne via Teams/Zoom' },
  { value: 'call', label: 'Appel téléphonique', icon: Phone, description: 'Conversation téléphonique' },
  { value: 'in_person', label: 'Rendez-vous physique', icon: MapPin, description: 'Rencontre dans nos locaux ou chez le client' }
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

const DURATIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 heure' },
  { value: 90, label: '1h30' },
  { value: 120, label: '2 heures' }
];

export const BookingScheduler: React.FC<BookingSchedulerProps> = ({
  isOpen,
  onClose,
  selectedProspect,
  onBookingScheduled
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    meeting_type: 'video',
    date: '',
    time: '',
    duration: 60,
    agenda: ''
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>(TIME_SLOTS);

  // Get tomorrow as minimum date
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  useEffect(() => {
    if (selectedProspect) {
      setBookingData(prev => ({
        ...prev,
        agenda: `Présentation des services Vybbi et discussion des besoins de ${selectedProspect.company_name || selectedProspect.contact_name}`
      }));
    }
  }, [selectedProspect]);

  useEffect(() => {
    if (bookingData.date) {
      checkAvailableSlots(bookingData.date);
    }
  }, [bookingData.date]);

  const checkAvailableSlots = async (date: string) => {
    // Simplified approach - just use all time slots for now
    setAvailableSlots(TIME_SLOTS);
  };

  const handleScheduleBooking = async () => {
    if (!selectedProspect || !bookingData.date || !bookingData.time) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Combine date and time
      const meetingDateTime = new Date(`${bookingData.date}T${bookingData.time}`);

      // For now, just log the meeting information
      console.log('Meeting scheduled:', {
        prospect_id: selectedProspect.id,
        meeting_type: bookingData.meeting_type,
        meeting_time: meetingDateTime.toISOString(),
        agenda: bookingData.agenda,
        duration: bookingData.duration
      });

      // Update prospect status
      await supabase
        .from('prospects')
        .update({ 
          status: 'qualified',
          last_contact_at: new Date().toISOString()
        })
        .eq('id', selectedProspect.id);

      // Send notification email to prospect
      await supabase.functions.invoke('send-notification', {
        body: {
          type: 'booking_confirmation',
          recipient: selectedProspect.email,
          data: {
            contact_name: selectedProspect.contact_name,
            meeting_date: bookingData.date,
            meeting_time: bookingData.time,
            meeting_type: bookingData.meeting_type,
            agenda: bookingData.agenda,
            duration: bookingData.duration
          }
        }
      });

        // Trigger webhook for external integrations
        await supabase.functions.invoke('prospect-webhooks', {
          body: {
            event_type: 'booking_scheduled',
            prospect_id: selectedProspect.id,
            data: {
              meeting_type: bookingData.meeting_type,
              meeting_time: meetingDateTime.toISOString(),
              agenda: bookingData.agenda
            }
          }
        });

        toast({
          title: "Rendez-vous planifié !",
          description: `Le rendez-vous avec ${selectedProspect.contact_name} a été programmé pour le ${bookingData.date} à ${bookingData.time}`
        });

        onBookingScheduled?.({ 
          id: 'temp-booking',
          prospect_id: selectedProspect.id,
          meeting_type: bookingData.meeting_type,
          meeting_time: meetingDateTime.toISOString(),
          agenda: bookingData.agenda
        });
      resetForm();
      onClose();

    } catch (error) {
      console.error('Error scheduling booking:', error);
      toast({
        title: "Erreur",
        description: "Impossible de programmer le rendez-vous. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setBookingData({
      meeting_type: 'video',
      date: '',
      time: '',
      duration: 60,
      agenda: ''
    });
  };

  const selectedMeetingType = MEETING_TYPES.find(type => type.value === bookingData.meeting_type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planifier un rendez-vous
          </DialogTitle>
        </DialogHeader>

        {selectedProspect && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="font-medium">{selectedProspect.contact_name}</span>
                {selectedProspect.company_name && (
                  <span className="text-muted-foreground">- {selectedProspect.company_name}</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* Meeting Type */}
          <div className="space-y-3">
            <Label>Type de rendez-vous</Label>
            <div className="grid grid-cols-1 gap-2">
              {MEETING_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <Card 
                    key={type.value}
                    className={`cursor-pointer transition-colors ${
                      bookingData.meeting_type === type.value 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setBookingData(prev => ({ ...prev, meeting_type: type.value as any }))}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                min={minDateString}
                value={bookingData.date}
                onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Heure</Label>
              <Select 
                value={bookingData.time} 
                onValueChange={(value) => setBookingData(prev => ({ ...prev, time: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'heure" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {slot}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Durée</Label>
            <Select 
              value={bookingData.duration.toString()} 
              onValueChange={(value) => setBookingData(prev => ({ ...prev, duration: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value.toString()}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location (for in-person meetings) */}
          {bookingData.meeting_type === 'in_person' && (
            <div className="space-y-2">
              <Label>Lieu de rendez-vous</Label>
              <Input
                placeholder="Adresse du rendez-vous"
                value={bookingData.location || ''}
                onChange={(e) => setBookingData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          )}

          {/* Agenda */}
          <div className="space-y-2">
            <Label>Ordre du jour</Label>
            <Textarea
              placeholder="Décrivez l'objectif du rendez-vous..."
              value={bookingData.agenda}
              onChange={(e) => setBookingData(prev => ({ ...prev, agenda: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes internes (optionnel)</Label>
            <Textarea
              placeholder="Notes pour préparer le rendez-vous..."
              value={bookingData.notes || ''}
              onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
              className="min-h-[60px]"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button 
            onClick={handleScheduleBooking}
            disabled={loading || !bookingData.date || !bookingData.time}
            className="flex-1"
          >
            {loading ? 'Planification...' : 'Planifier le rendez-vous'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};