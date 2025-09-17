import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AvailabilitySlot {
  id: string;
  start_date: string;
  end_date: string;
  status: 'available' | 'busy' | 'tentative' | 'unavailable';
  description?: string;
}

interface ArtistAvailabilityCalendarProps {
  artistId: string;
  isOwner?: boolean;
  className?: string;
}

export function ArtistAvailabilityCalendar({ 
  artistId, 
  isOwner = false, 
  className = '' 
}: ArtistAvailabilityCalendarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    startDate: new Date(),
    endDate: new Date(),
    status: 'available' as const,
    description: ''
  });

  useEffect(() => {
    fetchAvailability();
  }, [artistId]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('artist_profile_id', artistId)
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true });

      if (error) throw error;
      setAvailabilitySlots(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAvailabilitySlot = async () => {
    if (!isOwner || !user) return;

    try {
      const { error } = await supabase
        .from('availability_slots')
        .insert({
          artist_profile_id: artistId,
          start_date: format(newSlot.startDate, 'yyyy-MM-dd'),
          end_date: format(newSlot.endDate, 'yyyy-MM-dd'),
          status: newSlot.status,
          description: newSlot.description || null
        });

      if (error) throw error;

      toast({
        title: "Disponibilité ajoutée",
        description: "Votre créneau a été ajouté avec succès"
      });

      setIsAddDialogOpen(false);
      fetchAvailability();
    } catch (error) {
      console.error('Error adding availability:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la disponibilité",
        variant: "destructive"
      });
    }
  };

  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availabilitySlots.some(slot => {
      const start = new Date(slot.start_date);
      const end = new Date(slot.end_date);
      const checkDate = new Date(date);
      return checkDate >= start && checkDate <= end && slot.status === 'available';
    });
  };

  const isDateBusy = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availabilitySlots.some(slot => {
      const start = new Date(slot.start_date);
      const end = new Date(slot.end_date);
      const checkDate = new Date(date);
      return checkDate >= start && checkDate <= end && slot.status === 'busy';
    });
  };

  const getDateStatus = (date: Date) => {
    if (isDateAvailable(date)) return 'available';
    if (isDateBusy(date)) return 'busy';
    return null;
  };

  const upcomingAvailability = availabilitySlots
    .filter(slot => slot.status === 'available')
    .slice(0, 3);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-green-900 dark:text-green-100">
              <Calendar className="h-5 w-5" />
              Disponibilités
            </CardTitle>
            <p className="text-sm text-green-600 dark:text-green-300">
              Créneaux disponibles pour vos événements
            </p>
          </div>
          {isOwner && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="border-green-300">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une disponibilité</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date de début</Label>
                      <CalendarComponent
                        mode="single"
                        selected={newSlot.startDate}
                        onSelect={(date) => date && setNewSlot(prev => ({ ...prev, startDate: date }))}
                        className="rounded-md border p-3 pointer-events-auto"
                      />
                    </div>
                    <div>
                      <Label>Date de fin</Label>
                      <CalendarComponent
                        mode="single"
                        selected={newSlot.endDate}
                        onSelect={(date) => date && setNewSlot(prev => ({ ...prev, endDate: date }))}
                        className="rounded-md border p-3 pointer-events-auto"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Statut</Label>
                    <Select 
                      value={newSlot.status} 
                      onValueChange={(value: any) => setNewSlot(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Disponible</SelectItem>
                        <SelectItem value="busy">Occupé</SelectItem>
                        <SelectItem value="tentative">Provisoire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Description (optionnel)</Label>
                    <Textarea
                      value={newSlot.description}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Ex: Disponible pour concerts, Festival d'été..."
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                      Annuler
                    </Button>
                    <Button onClick={addAvailabilitySlot} className="flex-1">
                      Ajouter
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upcoming Availability */}
        {upcomingAvailability.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-foreground">Prochaines disponibilités</h4>
            {upcomingAvailability.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-sm font-medium">
                      {format(new Date(slot.start_date), 'dd MMM', { locale: fr })} - {format(new Date(slot.end_date), 'dd MMM yyyy', { locale: fr })}
                    </div>
                    {slot.description && (
                      <div className="text-xs text-muted-foreground">{slot.description}</div>
                    )}
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Libre
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Calendar View */}
        <div className="pt-2">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border bg-white/30 p-3 pointer-events-auto"
            modifiers={{
              available: (date) => isDateAvailable(date),
              busy: (date) => isDateBusy(date)
            }}
            modifiersStyles={{
              available: { backgroundColor: '#dcfce7', color: '#166534' },
              busy: { backgroundColor: '#fecaca', color: '#dc2626' }
            }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-200 rounded-full"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-200 rounded-full"></div>
            <span>Occupé</span>
          </div>
        </div>

        {/* Call to Action */}
        {!isOwner && (
          <div className="pt-3 border-t border-green-200/50">
            <div className="text-center space-y-1">
              <div className="text-xs font-medium text-green-900 dark:text-green-100">
                📅 Réservation rapide
              </div>
              <div className="text-xs text-green-600 dark:text-green-300">
                Contactez pour vérifier la disponibilité en temps réel
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}