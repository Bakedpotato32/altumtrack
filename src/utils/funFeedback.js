import confetti from 'canvas-confetti';

// 1. Native Mobile Haptic Vibrations (Zero-dependency & instant)
export function triggerHaptic(type = 'light') {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'selection': // micro tick for tab switching & drop-downs
        navigator.vibrate(12);
        break;
      case 'light': // button taps
        navigator.vibrate(18);
        break;
      case 'medium': // modal popups
        navigator.vibrate(28);
        break;
      case 'success': // fee paid / student saved
        navigator.vibrate([20, 40, 30]);
        break;
      case 'celebrate': // exam result / promotion
        navigator.vibrate([30, 60, 40, 80, 50]);
        break;
      case 'warning': // delete / trash
        navigator.vibrate([40, 50, 40]);
        break;
      default:
        navigator.vibrate(15);
    }
  } catch (e) {
    // Silently ignore if device disables vibration
  }
}

// 2. High-Energy Celebration Particle Cannons
export function triggerCelebration(mode = 'standard') {
  triggerHaptic('celebrate');

  if (mode === 'fee') {
    // Emerald & Gold Currency Shower
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#059669', '#fbbf24', '#f59e0b', '#38bdf8']
    });
  } else if (mode === 'rank') {
    // Dual Golden Star Cannon
    confetti({
      particleCount: 70,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#f59e0b', '#fbbf24', '#6366f1', '#ec4899']
    });
    confetti({
      particleCount: 70,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#f59e0b', '#fbbf24', '#6366f1', '#ec4899']
    });
  } else {
    // School Pride Fireworks
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.65 }
    });
  }
}
