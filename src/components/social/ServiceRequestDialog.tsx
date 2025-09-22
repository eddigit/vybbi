import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Handshake } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CreateServiceRequestData } from "@/types/social";

interface ServiceRequestDialogProps {
  children: React.ReactNode;
  onSubmit: (data: CreateServiceRequestData) => Promise<void>;
  isSubmitting: boolean;
}

export function ServiceRequestDialog({ children, onSubmit, isSubmitting }: ServiceRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateServiceRequestData>({
    request_type: 'demand',
    service_category: 'performance',
    location: '',
    description: '',
  });
  const [eventDate, setEventDate] = useState<Date>();
  const [deadline, setDeadline] = useState<Date>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: CreateServiceRequestData = {
      ...formData,
      event_date: eventDate ? eventDate.toISOString().split('T')[0] : undefined,
      deadline: deadline ? deadline.toISOString().split('T')[0] : undefined,
    };

    await onSubmit(submitData);
    setOpen(false);
    // Reset form
    setFormData({
      request_type: 'demand',
      service_category: 'performance',
      location: '',
      description: '',
    });
    setEventDate(undefined);
    setDeadline(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-orange-500" />
            Créer une prestation
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type de demande */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Type de prestation</Label>
            <RadioGroup
              value={formData.request_type}
              onValueChange={(value: 'offer' | 'demand') => 
                setFormData(prev => ({ ...prev, request_type: value }))
              }
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="demand" id="demand" />
                <Label htmlFor="demand">Je recherche</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="offer" id="offer" />
                <Label htmlFor="offer">Je propose</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Catégorie */}
          <div className="space-y-3">
            <Label htmlFor="category" className="text-base font-semibold">Catégorie</Label>
            <Select
              value={formData.service_category}
              onValueChange={(value: 'performance' | 'venue' | 'agent' | 'other') =>
                setFormData(prev => ({ ...prev, service_category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance artistique</SelectItem>
                <SelectItem value="venue">Lieu/Venue</SelectItem>
                <SelectItem value="agent">Agent/Manager</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Localisation */}
          <div className="space-y-3">
            <Label htmlFor="location" className="text-base font-semibold">Ville/Localisation *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Paris, Lyon, Marseille..."
              required
            />
          </div>

          {/* Budget */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Budget (€)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="budget_min" className="text-sm text-muted-foreground">Minimum</Label>
                <Input
                  id="budget_min"
                  type="number"
                  value={formData.budget_min || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    budget_min: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="500"
                />
              </div>
              <div>
                <Label htmlFor="budget_max" className="text-sm text-muted-foreground">Maximum</Label>
                <Input
                  id="budget_max"
                  type="number"
                  value={formData.budget_max || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    budget_max: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="2000"
                />
              </div>
            </div>
          </div>

          {/* Date événement */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Date souhaitée</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !eventDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date limite */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Date limite de réponse</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP", { locale: fr }) : "Sélectionner une date limite"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-base font-semibold">Description de la mission *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez votre demande ou offre de prestation..."
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Exigences */}
          <div className="space-y-3">
            <Label htmlFor="requirements" className="text-base font-semibold">Exigences particulières</Label>
            <Textarea
              id="requirements"
              value={formData.requirements || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              placeholder="Matériel, expérience, style musical..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.location || !formData.description || isSubmitting}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isSubmitting ? "Création..." : "Créer la prestation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}