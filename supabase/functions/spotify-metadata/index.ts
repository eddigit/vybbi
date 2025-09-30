import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string, height: number, width: number }>
    release_date: string
  }
  duration_ms: number
  preview_url: string | null
  external_urls: {
    spotify: string
  }
  explicit: boolean
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query, type = 'track' } = await req.json()

    if (!query) {
      throw new Error('Query parameter is required')
    }

    // Get Spotify access token
    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID')
    const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET')

    if (!clientId || !clientSecret) {
      throw new Error('Spotify credentials not configured')
    }

    // Get access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to get Spotify access token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Search for tracks
    const searchUrl = new URL('https://api.spotify.com/v1/search')
    searchUrl.searchParams.set('q', query)
    searchUrl.searchParams.set('type', type)
    searchUrl.searchParams.set('limit', '10')
    searchUrl.searchParams.set('market', 'FR')

    const searchResponse = await fetch(searchUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!searchResponse.ok) {
      throw new Error('Failed to search Spotify')
    }

    const searchData: SpotifySearchResponse = await searchResponse.json()

    // Transform the data to match our format
    const tracks = searchData.tracks.items.map(track => ({
      spotify_id: track.id,
      title: track.name,
      artist_name: track.artists.map(a => a.name).join(', '),
      album_name: track.album.name,
      cover_image_url: track.album.images[0]?.url || null,
      release_date: track.album.release_date,
      duration_seconds: Math.floor(track.duration_ms / 1000),
      preview_url: track.preview_url,
      spotify_url: track.external_urls.spotify,
      explicit_content: track.explicit,
      genre: null, // Spotify doesn't provide genre in search results
    }))

    return new Response(
      JSON.stringify({ tracks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error fetching Spotify metadata:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch Spotify metadata',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})