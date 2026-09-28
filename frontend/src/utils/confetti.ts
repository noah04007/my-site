import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#A855F7', '#C084FC', '#E879F9', '#DDD6FE', '#F59E0B'],
      ticks: 200,
      gravity: 1.2
    });
  } catch {
    // Graceful fallback
  }
}

export function fireGrandCelebration() {
  try {
    const end = Date.now() + 1.2 * 1000;
    const colors = ['#A855F7', '#C084FC', '#9333EA', '#E9D5FF', '#F59E0B'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch {
    // Graceful fallback
  }
}
