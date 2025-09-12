import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TickerMessage {
  id: string;
  message: string;
  is_active: boolean;
  display_order: number;
}

export function TickerBanner() {
  const [messages, setMessages] = useState<TickerMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('site_ticker_messages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching ticker messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching ticker messages:', error);
    }
  };

  useEffect(() => {
    if (messages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [messages.length]);

  const currentMessage = messages[currentIndex]?.message || "THE HYPE OF THE NIGHT";

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary via-purple-600 to-pink-600 rounded-full px-6 py-3 shadow-lg">
      <div className="flex items-center justify-center">
        <div className="relative h-6 flex items-center">
          <div 
            className="whitespace-nowrap text-white font-bold text-sm uppercase tracking-wider animate-marquee"
            style={{
              textShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)',
              fontFamily: 'Arial Black, sans-serif'
            }}
          >
            {currentMessage}
          </div>
        </div>
      </div>
      
      {/* Disco effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30 animate-pulse pointer-events-none" />
    </div>
  );
}