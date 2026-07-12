# CM-008 v3 — Filter overlay stacking fix

The filter sheet is now rendered through a React portal directly into `document.body`.
This escapes all parent stacking contexts, so the fixed bottom navigation cannot appear above the sheet.
Overlay z-indexes were also raised to 1000/1010.
