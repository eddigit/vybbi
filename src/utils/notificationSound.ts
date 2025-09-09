// Créer et jouer un son de notification musical
export const playNotificationSound = async (): Promise<void> => {
  try {
    // Créer un contexte audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Créer une séquence de notes pour un son de cloche musical
    const notes = [
      { frequency: 880, duration: 0.1 }, // A5
      { frequency: 1108.73, duration: 0.1 }, // C#6
      { frequency: 1396.91, duration: 0.15 } // F6
    ];
    
    let startTime = audioContext.currentTime;
    
    for (const note of notes) {
      // Créer un oscillateur pour chaque note
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Configuration de l'oscillateur
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(note.frequency, startTime);
      
      // Envelope ADSR pour un son de cloche
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01); // Attack
      gainNode.gain.exponentialRampToValueAtTime(0.1, startTime + 0.05); // Decay
      gainNode.gain.linearRampToValueAtTime(0.05, startTime + note.duration - 0.02); // Sustain
      gainNode.gain.linearRampToValueAtTime(0, startTime + note.duration); // Release
      
      // Connecter les nœuds
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Démarrer et arrêter l'oscillateur
      oscillator.start(startTime);
      oscillator.stop(startTime + note.duration);
      
      startTime += note.duration * 0.3; // Chevauchement des notes
    }
    
    console.log('Son de notification joué');
  } catch (error) {
    console.error('Erreur lors de la lecture du son de notification:', error);
  }
};