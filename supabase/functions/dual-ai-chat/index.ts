import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  conversation_history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface ChatResponse {
  message?: string;
  provider: 'google' | 'huggingface' | 'none';
  success: boolean;
  error?: string;
}

// Google AI API call
async function callGoogleAI(message: string, history: Array<{ role: string; content: string }> = []): Promise<string> {
  const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
  
  if (!GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY not configured');
  }

  // Build conversation context
  let fullContext = '';
  if (history.length > 0) {
    fullContext = history.map(h => `${h.role}: ${h.content}`).join('\n') + '\n';
  }
  fullContext += `user: ${message}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: fullContext
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Google AI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
    throw new Error('Invalid response format from Google AI');
  }

  return data.candidates[0].content.parts[0].text;
}

// Hugging Face API call
async function callHuggingFace(message: string): Promise<string> {
  const HF_TOKEN = Deno.env.get('HUGGING_FACE_TOKEN');
  
  if (!HF_TOKEN) {
    throw new Error('HUGGING_FACE_TOKEN not configured');
  }

  const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: message,
      parameters: {
        max_new_tokens: 250,
        temperature: 0.7,
        return_full_text: false
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (Array.isArray(data) && data[0] && data[0].generated_text) {
    return data[0].generated_text.trim();
  }
  
  throw new Error('Invalid response format from Hugging Face');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversation_history = [] }: ChatRequest = await req.json();

    // Validate message length (max 500 characters)
    if (!message || message.length > 500) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Message is required and must be under 500 characters',
          provider: 'none'
        } as ChatResponse),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let aiResponse: string;
    let provider: 'google' | 'huggingface' = 'google';

    try {
      // Try Google AI first with 10 second timeout
      console.log('Attempting Google AI...');
      const googlePromise = callGoogleAI(message, conversation_history);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      aiResponse = await Promise.race([googlePromise, timeoutPromise]);
      console.log('Google AI successful');
      
    } catch (googleError) {
      console.log('Google AI failed, trying Hugging Face:', googleError instanceof Error ? googleError.message : 'Unknown error');
      
      try {
        // Fallback to Hugging Face
        aiResponse = await callHuggingFace(message);
        provider = 'huggingface';
        console.log('Hugging Face successful');
        
      } catch (hfError) {
        console.error('Both APIs failed:', { 
          googleError: googleError instanceof Error ? googleError.message : 'Unknown error', 
          hfError: hfError instanceof Error ? hfError.message : 'Unknown error' 
        });
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Both AI services are currently unavailable. Please try again later.',
            provider: 'none'
          } as ChatResponse),
          { 
            status: 503, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    const response: ChatResponse = {
      message: aiResponse,
      provider,
      success: true
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred',
        provider: 'none'
      } as ChatResponse),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});