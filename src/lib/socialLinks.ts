// Configuration des liens des réseaux sociaux de Vybbi
export const VYBBI_SOCIAL_LINKS = {
  tiktok: "https://www.tiktok.com/@vybbi_app",
  instagram: "https://www.instagram.com/vybbi_app/",
  facebook: "https://www.facebook.com/profile.php?id=61580494607824",
  soundcloud: "https://soundcloud.com/vibby-514717035",
  spotify: "https://open.spotify.com/user/31sfvdw6ahwbhpbbjgwi5lmnr43a",
  linkedin: "https://www.linkedin.com/in/vibby-vibby-01511b384/",
  youtube: "https://www.youtube.com/@Vibby-l3q4d",
  twitter: "https://x.com/vybbiapp",
  bandcamp: "https://vybbi.bandcamp.com/",
  mixcloud: "https://www.mixcloud.com/Vybbi/"
} as const;

export type SocialPlatform = keyof typeof VYBBI_SOCIAL_LINKS;