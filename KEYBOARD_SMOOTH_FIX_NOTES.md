# CM-008 — Smooth keyboard interaction

- Keyboard viewport events are throttled with requestAnimationFrame.
- Event listeners are no longer recreated after every typed character.
- Tiny intermediate keyboard height changes are ignored.
- The form scrolls only once after focus, after the keyboard animation settles.
- visualViewport scroll events no longer trigger layout recalculation.
- Bottom inset changes animate softly.
