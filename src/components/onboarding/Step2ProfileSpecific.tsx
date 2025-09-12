import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingData } from '@/hooks/useOnboarding';
import { LANGUAGES } from '@/lib/languages';
import { TALENTS, TALENT_CATEGORIES } from '@/lib/talents';

interface Step2ProfileSpecificProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  profileType: string;
}

export function Step2ProfileSpecific({ data, updateData, profileType }: Step2ProfileSpecificProps) {
  const handleGenresChange = (genresString: string) => {
    const genres = genresString
      .split(',')
      .map(g => g.trim())
      .filter(g => g.length > 0);
    updateData({ genres });
  };

  const toggleLanguage = (languageCode: string) => {
    const newLanguages = data.languages.includes(languageCode)
      ? data.languages.filter(l => l !== languageCode)
      : [...data.languages, languageCode];
    updateData({ languages: newLanguages });
  };

  const toggleTalent = (talentId: string) => {
    const newTalents = data.talents.includes(talentId)
      ? data.talents.filter(t => t !== talentId)
      : [...data.talents, talentId];
    updateData({ talents: newTalents });
  };

  if (profileType === 'artist') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Votre univers artistique</h3>
          <p className="text-muted-foreground">
            Aidez-nous à comprendre votre style et vos compétences
          </p>
        </div>

        <div>
          <Label htmlFor="genres">
            Genres musicaux <span className="text-destructive">*</span>
          </Label>
          <Input
            id="genres"
            value={data.genres.join(', ')}
            onChange={(e) => handleGenresChange(e.target.value)}
            placeholder="Rock, Jazz, Pop..."
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Séparez les genres par des virgules
          </p>
        </div>

        <div>
          <Label htmlFor="experience">Expérience artistique</Label>
          <Textarea
            id="experience"
            value={data.experience}
            onChange={(e) => updateData({ experience: e.target.value })}
            placeholder="Décrivez votre parcours, vos influences, vos projets..."
            rows={3}
          />
        </div>

        {/* Talents */}
        <div>
          <Label className="text-base font-semibold">Talents artistiques</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Sélectionnez tous vos talents (sélection multiple possible)
          </p>
          
          {TALENT_CATEGORIES.map((category) => (
            <div key={category.id} className="mb-6">
              <h4 className="font-medium flex items-center gap-2 mb-3 text-sm">
                <span>{category.icon}</span>
                {category.label}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {TALENTS.filter(talent => talent.category === category.id).map((talent) => (
                  <Button
                    key={talent.id}
                    type="button"
                    variant={data.talents.includes(talent.id) ? "default" : "outline"}
                    size="sm"
                    className="justify-start text-xs h-auto py-2"
                    onClick={() => toggleTalent(talent.id)}
                  >
                    <span className="mr-1">{talent.icon}</span>
                    {talent.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Languages */}
        <div>
          <Label>Langues parlées</Label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                type="button"
                variant={data.languages.includes(lang.code) ? "default" : "outline"}
                size="sm"
                className="justify-start text-xs h-auto py-2"
                onClick={() => toggleLanguage(lang.code)}
              >
                <span className="mr-1">{lang.flag}</span>
                {lang.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (profileType === 'lieu') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Votre établissement</h3>
          <p className="text-muted-foreground">
            Décrivez votre lieu et vos capacités d'accueil
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="venue_category">
              Type d'établissement <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.venue_category}
              onValueChange={(value) => updateData({ venue_category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="club">Club</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="salle_concert">Salle de concert</SelectItem>
                <SelectItem value="festival">Festival</SelectItem>
                <SelectItem value="hotel">Hôtel</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="venue_capacity">Capacité d'accueil</Label>
            <Input
              id="venue_capacity"
              type="number"
              value={data.venue_capacity || ''}
              onChange={(e) => updateData({ venue_capacity: parseInt(e.target.value) || 0 })}
              placeholder="Nombre de personnes"
              min="0"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="genres">Styles musicaux accueillis</Label>
          <Input
            id="genres"
            value={data.genres.join(', ')}
            onChange={(e) => handleGenresChange(e.target.value)}
            placeholder="Tous styles, Jazz, Rock..."
          />
        </div>

        {/* Languages */}
        <div>
          <Label>Langues parlées par l'équipe</Label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                type="button"
                variant={data.languages.includes(lang.code) ? "default" : "outline"}
                size="sm"
                className="justify-start text-xs h-auto py-2"
                onClick={() => toggleLanguage(lang.code)}
              >
                <span className="mr-1">{lang.flag}</span>
                {lang.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Agent/Manager
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Votre activité</h3>
        <p className="text-muted-foreground">
          Décrivez vos services et votre expertise
        </p>
      </div>

      <div>
        <Label htmlFor="experience">
          Expérience professionnelle <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="experience"
          value={data.experience}
          onChange={(e) => updateData({ experience: e.target.value })}
          placeholder="Décrivez votre parcours professionnel, vos spécialités..."
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="genres">Secteurs d'activité</Label>
        <Input
          id="genres"
          value={data.genres.join(', ')}
          onChange={(e) => handleGenresChange(e.target.value)}
          placeholder="Musique live, Événementiel, Production..."
        />
      </div>

      {/* Languages */}
      <div>
        <Label>Langues parlées</Label>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
          {LANGUAGES.map((lang) => (
            <Button
              key={lang.code}
              type="button"
              variant={data.languages.includes(lang.code) ? "default" : "outline"}
              size="sm"
              className="justify-start text-xs h-auto py-2"
              onClick={() => toggleLanguage(lang.code)}
            >
              <span className="mr-1">{lang.flag}</span>
              {lang.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}