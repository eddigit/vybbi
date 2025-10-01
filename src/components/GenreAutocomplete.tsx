import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { filterGenres } from '@/lib/musicGenres';

interface GenreAutocompleteProps {
  value: string[];
  onChange: (genres: string[]) => void;
  placeholder?: string;
  maxGenres?: number;
}

export function GenreAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Tapez pour rechercher...",
  maxGenres = 5
}: GenreAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue.trim()) {
      setSuggestions(filterGenres(inputValue).slice(0, 8));
    } else {
      setSuggestions(filterGenres('').slice(0, 8));
    }
  }, [inputValue]);

  // Fermer les suggestions si on clique dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addGenre = (genre: string) => {
    if (!value.includes(genre) && value.length < maxGenres) {
      onChange([...value, genre]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeGenre = (genreToRemove: string) => {
    onChange(value.filter(g => g !== genreToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (suggestions.length > 0) {
        addGenre(suggestions[0]);
      } else if (inputValue.trim()) {
        // Ajouter le texte personnalisé
        addGenre(inputValue.trim());
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Genres sélectionnés */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((genre) => (
            <Badge 
              key={genre} 
              variant="secondary" 
              className="px-3 py-1 text-sm flex items-center gap-2"
            >
              {genre}
              <button
                type="button"
                onClick={() => removeGenre(genre)}
                className="hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input avec suggestions */}
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length >= maxGenres ? `Maximum ${maxGenres} genres` : placeholder}
            disabled={value.length >= maxGenres}
            className="pr-10"
          />
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => {
                if (suggestions.length > 0) {
                  addGenre(suggestions[0]);
                } else if (inputValue.trim()) {
                  addGenre(inputValue.trim());
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Liste de suggestions */}
        {showSuggestions && suggestions.length > 0 && value.length < maxGenres && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {suggestions
              .filter(genre => !value.includes(genre))
              .map((genre, index) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => addGenre(genre)}
                  className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors ${
                    index === 0 ? 'font-medium bg-accent/50' : ''
                  }`}
                >
                  {genre}
                  {index === 0 && <span className="text-xs text-muted-foreground ml-2">↵</span>}
                </button>
              ))
            }
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {value.length}/{maxGenres} genres • Appuyez sur Entrée ou cliquez sur + pour ajouter
      </p>
    </div>
  );
}
