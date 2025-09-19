import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp,
  User,
  Building,
  Mail,
  Phone,
  Star,
  Filter
} from 'lucide-react';
import { SupabaseProspect } from '@/hooks/useProspects';

interface IntelligentSearchProps {
  prospects: SupabaseProspect[];
  onSearchResults: (results: SupabaseProspect[]) => void;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

interface SearchSuggestion {
  type: 'recent' | 'contact' | 'company' | 'status' | 'type';
  value: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
  prospect?: SupabaseProspect;
}

export default function IntelligentSearch({
  prospects, 
  onSearchResults, 
  onSearchChange,
  placeholder = "Rechercher prospects, entreprises, emails..."
}: IntelligentSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vybbi-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Generate intelligent suggestions
  useEffect(() => {
    if (query.length < 2) {
      // Show recent searches and popular filters when no query
      const recentSuggestions: SearchSuggestion[] = recentSearches.slice(0, 3).map(search => ({
        type: 'recent',
        value: search,
        label: search,
        icon: <Clock className="h-4 w-4 text-muted-foreground" />
      }));

      const statusSuggestions: SearchSuggestion[] = [
        { type: 'status', value: 'new', label: 'Nouveaux prospects', icon: <TrendingUp className="h-4 w-4 text-blue-500" />, count: prospects.filter(p => p.status === 'new').length },
        { type: 'status', value: 'qualified', label: 'Prospects qualifiés', icon: <Star className="h-4 w-4 text-yellow-500" />, count: prospects.filter(p => p.status === 'qualified').length },
        { type: 'type', value: 'artist', label: 'Artistes', icon: <User className="h-4 w-4 text-purple-500" />, count: prospects.filter(p => p.prospect_type === 'artist').length }
      ];

      setSuggestions([...recentSuggestions, ...statusSuggestions]);
      return;
    }

    const searchQuery = query.toLowerCase();
    const newSuggestions: SearchSuggestion[] = [];

    // Search in prospect names
    const nameMatches = prospects.filter(p => 
      p.contact_name?.toLowerCase().includes(searchQuery)
    ).slice(0, 3);
    
    nameMatches.forEach(prospect => {
      newSuggestions.push({
        type: 'contact',
        value: prospect.contact_name,
        label: `${prospect.contact_name} - ${prospect.company_name || 'Prospect'}`,
        icon: <User className="h-4 w-4 text-blue-500" />,
        prospect
      });
    });

    // Search in company names
    const companyMatches = prospects.filter(p => 
      p.company_name?.toLowerCase().includes(searchQuery) &&
      !nameMatches.some(nm => nm.id === p.id)
    ).slice(0, 3);
    
    companyMatches.forEach(prospect => {
      newSuggestions.push({
        type: 'company',
        value: prospect.company_name || '',
        label: `${prospect.company_name} - ${prospect.contact_name}`,
        icon: <Building className="h-4 w-4 text-green-500" />,
        prospect
      });
    });

    // Search in emails
    const emailMatches = prospects.filter(p => 
      p.email?.toLowerCase().includes(searchQuery) &&
      !nameMatches.some(nm => nm.id === p.id) &&
      !companyMatches.some(cm => cm.id === p.id)
    ).slice(0, 2);
    
    emailMatches.forEach(prospect => {
      newSuggestions.push({
        type: 'contact',
        value: prospect.email || '',
        label: `${prospect.email} - ${prospect.contact_name}`,
        icon: <Mail className="h-4 w-4 text-orange-500" />,
        prospect
      });
    });

    setSuggestions(newSuggestions);
  }, [query, prospects, recentSearches]);

  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      onSearchResults(prospects);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const results = prospects.filter(prospect => {
      return (
        prospect.contact_name?.toLowerCase().includes(lowerQuery) ||
        prospect.company_name?.toLowerCase().includes(lowerQuery) ||
        prospect.email?.toLowerCase().includes(lowerQuery) ||
        prospect.phone?.includes(searchQuery) ||
        prospect.status?.toLowerCase().includes(lowerQuery) ||
        prospect.prospect_type?.toLowerCase().includes(lowerQuery) ||
        prospect.city?.toLowerCase().includes(lowerQuery) ||
        prospect.notes?.toLowerCase().includes(lowerQuery) ||
        prospect.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });

    onSearchResults(results);
    
    // Save to recent searches
    const newRecentSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('vybbi-recent-searches', JSON.stringify(newRecentSearches));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearchChange(value);
    performSearch(value);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.prospect) {
      // If clicking on a specific prospect, set that as search and filter
      setQuery(suggestion.label);
      onSearchResults([suggestion.prospect]);
    } else {
      // If clicking on a filter suggestion, set that as search
      setQuery(suggestion.value);
      performSearch(suggestion.value);
    }
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          performSearch(query);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearSearch = () => {
    setQuery('');
    onSearchChange('');
    onSearchResults(prospects);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 h-11 text-sm"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg border border-border/50">
          <CardContent className="p-2">
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.type}-${suggestion.value}-${index}`}
                  ref={el => suggestionRefs.current[index] = el}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                    index === selectedIndex 
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {suggestion.icon}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {suggestion.label}
                      </div>
                      {suggestion.type === 'recent' && (
                        <div className="text-xs text-muted-foreground">
                          Recherche récente
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {suggestion.count !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.count}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            
            {query.length >= 2 && (
              <div className="border-t mt-2 pt-2">
                <div className="text-xs text-muted-foreground px-2">
                  Appuyez sur Entrée pour rechercher "{query}"
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}