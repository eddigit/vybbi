// Contexte audio global
let audioContext: AudioContext | null = null;
let isAudioInitialized = false;

// Initialiser le contexte audio après interaction utilisateur
export const initializeAudio = async (): Promise<void> => {
  if (isAudioInitialized) return;
  
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Forcer le démarrage du contexte audio
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    isAudioInitialized = true;
    console.log('Contexte audio initialisé');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation audio:', error);
  }
};

// Créer et jouer un son de notification musical
export const playNotificationSound = async (): Promise<void> => {
  try {
    // Initialiser l'audio si ce n'est pas déjà fait
    if (!audioContext || !isAudioInitialized) {
      await initializeAudio();
    }
    
    if (!audioContext) {
      console.warn('Contexte audio non disponible');
      return;
    }

    // Forcer la reprise si suspendu
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Créer un son de cloche simple mais efficace
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Configuration pour un son de notification agréable
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    // Envelope pour un son doux
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    // Connecter et jouer
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    console.log('Son de notification joué');
  } catch (error) {
    console.error('Erreur lors de la lecture du son de notification:', error);
  }
};

// Initialiser l'audio lors du premier clic sur la page
document.addEventListener('click', initializeAudio, { once: true });
document.addEventListener('keydown', initializeAudio, { once: true });