# CM-006 — Hide wizard footer while keyboard is open

- The Continue/Review footer is hidden when an input, textarea, select, or editable element receives focus.
- Added Visual Viewport fallback for mobile browsers where keyboard focus events are delayed.
- The footer returns with a short animation after the keyboard closes.
- Draft autosave and viewport restoration remain enabled.
- TypeScript typecheck and production build passed before packaging.
