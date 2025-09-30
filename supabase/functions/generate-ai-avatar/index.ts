import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, profileType, seed } = await req.json()
    
    // Customize prompt based on profile type
    let enhancedPrompt = ''
    
    switch (profileType) {
      case 'artist':
        enhancedPrompt = `Professional headshot of a ${prompt} musician/artist, studio lighting, confident expression, looking at camera, high quality portrait photography, 4K resolution`
        break
      case 'lieu':
        enhancedPrompt = `Modern venue interior photo, ${prompt} style, professional architecture photography, ambient lighting, welcoming atmosphere, high quality, 4K resolution`
        break
      case 'agent':
      case 'manager':
        enhancedPrompt = `Professional business portrait of a ${prompt} music industry professional, corporate headshot, confident expression, business attire, studio lighting, high quality, 4K resolution`
        break
      default:
        enhancedPrompt = `Professional portrait of a ${prompt}, high quality photography, 4K resolution`
    }

    // Generate image using OpenAI's DALL-E
    const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "natural"
      })
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const imageData = await openaiResponse.json()
    
    return new Response(
      JSON.stringify({ 
        imageUrl: imageData.data[0].url,
        enhancedPrompt 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate avatar', details: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})