import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Quote, Plus, Award, Star, Building, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  author_company?: string;
  author_avatar?: string;
  content: string;
  type: 'professional' | 'venue' | 'collaboration' | 'media';
  rating?: number;
  created_at: string;
}

interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  type: 'award' | 'certification' | 'label' | 'partnership';
  verified: boolean;
}

interface TestimonialsSectionProps {
  profileId?: string;
  isOwner?: boolean;
}

export const TestimonialsSection = ({ profileId, isOwner = false }: TestimonialsSectionProps) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: '1',
      author_name: 'Sarah Martinez',
      author_role: 'Directrice Artistique',
      author_company: 'Festival Les Nuits Sonores',
      content: 'Un artiste exceptionnel avec une présence scénique remarquable. Sa performance a été le point culminant de notre festival.',
      type: 'venue',
      rating: 5,
      created_at: '2024-01-15',
      author_avatar: undefined
    },
    {
      id: '2',
      author_name: 'Mike Johnson',
      author_role: 'Producteur Musical',
      author_company: 'Studio Blue Records',
      content: 'Collaboration très fluide et professionnelle. Un talent authentique avec une vision artistique claire.',
      type: 'professional',
      created_at: '2023-11-20'
    }
  ]);

  const [certifications] = useState<Certification[]>([
    {
      id: '1',
      title: 'Révélation Scène 2024',
      issuer: 'Les Victoires de la Musique',
      date: '2024-02-10',
      type: 'award',
      verified: true
    },
    {
      id: '2',
      title: 'Artiste Labellisé',
      issuer: 'SACEM Développement',
      date: '2023-09-15',
      type: 'certification',
      verified: true
    }
  ]);

  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    author_name: '',
    author_role: '',
    author_company: '',
    content: '',
    type: 'professional' as const
  });

  const { toast } = useToast();

  const handleAddTestimonial = () => {
    if (!newTestimonial.author_name || !newTestimonial.content) {
      toast({
        title: "Champs requis manquants",
        description: "Veuillez remplir au minimum le nom et le témoignage.",
        variant: "destructive"
      });
      return;
    }

    const testimonial: Testimonial = {
      id: Date.now().toString(),
      ...newTestimonial,
      created_at: new Date().toISOString().split('T')[0]
    };

    setTestimonials(prev => [testimonial, ...prev]);
    setNewTestimonial({
      author_name: '',
      author_role: '',
      author_company: '',
      content: '',
      type: 'professional'
    });
    setIsAddingTestimonial(false);

    toast({
      title: "Témoignage ajouté",
      description: "Le témoignage professionnel a été ajouté avec succès."
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'venue': return Building;
      case 'collaboration': return Music;
      case 'media': return Star;
      case 'award': return Award;
      default: return Quote;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'venue': return 'Organisateur/Festival';
      case 'collaboration': return 'Collaboration';
      case 'media': return 'Média';
      case 'professional': return 'Professionnel';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'venue': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'collaboration': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'media': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'professional': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Certifications Section */}
      {certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Certifications & Prix</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {certifications.map((cert) => {
                const IconComponent = getTypeIcon(cert.type);
                return (
                  <div key={cert.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium truncate">{cert.title}</p>
                        {cert.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Vérifié
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                      <p className="text-xs text-muted-foreground">{new Date(cert.date).getFullYear()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testimonials Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Quote className="w-5 h-5" />
                <span>Témoignages Professionnels</span>
              </CardTitle>
              <CardDescription>
                Recommandations de collaborateurs, organisateurs et professionnels du secteur
              </CardDescription>
            </div>
            {isOwner && (
              <Dialog open={isAddingTestimonial} onOpenChange={setIsAddingTestimonial}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Ajouter un témoignage professionnel</DialogTitle>
                    <DialogDescription>
                      Ajoutez une recommandation d'un professionnel qui a travaillé avec vous.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="author_name">Nom *</Label>
                        <Input
                          id="author_name"
                          value={newTestimonial.author_name}
                          onChange={(e) => setNewTestimonial(prev => ({ ...prev, author_name: e.target.value }))}
                          placeholder="Sarah Martinez"
                        />
                      </div>
                      <div>
                        <Label htmlFor="author_role">Fonction</Label>
                        <Input
                          id="author_role"
                          value={newTestimonial.author_role}
                          onChange={(e) => setNewTestimonial(prev => ({ ...prev, author_role: e.target.value }))}
                          placeholder="Directrice Artistique"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="author_company">Organisation</Label>
                        <Input
                          id="author_company"
                          value={newTestimonial.author_company}
                          onChange={(e) => setNewTestimonial(prev => ({ ...prev, author_company: e.target.value }))}
                          placeholder="Festival Les Nuits Sonores"
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={newTestimonial.type}
                          onValueChange={(value: any) => setNewTestimonial(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professionnel</SelectItem>
                            <SelectItem value="venue">Organisateur/Festival</SelectItem>
                            <SelectItem value="collaboration">Collaboration</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="content">Témoignage *</Label>
                      <Textarea
                        id="content"
                        value={newTestimonial.content}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Décrivez votre expérience de collaboration..."
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button onClick={handleAddTestimonial} className="flex-1">
                        Ajouter le témoignage
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingTestimonial(false)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={testimonial.author_avatar} />
                      <AvatarFallback>
                        {testimonial.author_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium">{testimonial.author_name}</h4>
                            <Badge variant="outline" className={getTypeColor(testimonial.type)}>
                              {getTypeLabel(testimonial.type)}
                            </Badge>
                          </div>
                          {testimonial.author_role && (
                            <p className="text-xs text-muted-foreground">
                              {testimonial.author_role}
                              {testimonial.author_company && ` • ${testimonial.author_company}`}
                            </p>
                          )}
                        </div>
                        {testimonial.rating && (
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <blockquote className="text-sm text-foreground italic">
                        "{testimonial.content}"
                      </blockquote>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(testimonial.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {testimonials.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Quote className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun témoignage professionnel pour le moment.</p>
                {isOwner && (
                  <p className="text-sm mt-1">
                    Ajoutez des recommandations pour renforcer votre crédibilité professionnelle.
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};