import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VybbiButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showText?: boolean;
}

export function VybbiButton({ 
  variant = 'outline', 
  size = 'sm', 
  className = '',
  showText = true 
}: VybbiButtonProps) {
  return (
    <Button 
      asChild 
      variant={variant} 
      size={size} 
      className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none ${className}`}
    >
      <Link to="/recherche-avancee" className="flex items-center gap-2">
        <Bot className="h-4 w-4" />
        {showText && <span className="font-vybbi">Assistant Vybbi</span>}
      </Link>
    </Button>
  );
}