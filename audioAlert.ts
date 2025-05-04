// Create a context for playing audio
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

// Function to generate a beep sound
function createBeepSound(frequency = 880, duration = 400, volume = 0.5, type = 'sine') {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = type as OscillatorType;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  return {
    start: () => {
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, duration);
    }
  };
}

// Play a sequence of alert beeps
export function playAlertSound() {
  // Resume the audio context if it's suspended (browsers require user interaction)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  // Create a series of beeps for the alert
  const beep1 = createBeepSound(880, 300, 0.5, 'sine');
  const beep2 = createBeepSound(660, 300, 0.5, 'sine');
  const beep3 = createBeepSound(880, 300, 0.5, 'sine');
  
  // Play the beeps in sequence
  beep1.start();
  setTimeout(() => beep2.start(), 350);
  setTimeout(() => beep3.start(), 700);
  
  // Play the sequence again after 2 seconds
  setTimeout(() => {
    beep1.start();
    setTimeout(() => beep2.start(), 350);
    setTimeout(() => beep3.start(), 700);
  }, 1500);
}

// Load and play an emergency siren sound
let sirenAudio: HTMLAudioElement | null = null;

export function playSirenSound() {
  // Create audio element if it doesn't exist
  if (!sirenAudio) {
    sirenAudio = new Audio();
    sirenAudio.src = 'https://soundbible.com/grab.php?id=2179&type=mp3'; // Link to a siren sound file
    sirenAudio.loop = true;
  }
  
  // Play the siren
  sirenAudio.play().catch(error => {
    console.error('Failed to play siren sound:', error);
  });
}

// Stop the siren sound
export function stopSirenSound() {
  if (sirenAudio) {
    sirenAudio.pause();
    sirenAudio.currentTime = 0;
  }
}
