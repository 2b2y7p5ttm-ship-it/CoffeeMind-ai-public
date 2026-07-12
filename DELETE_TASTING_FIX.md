# Delete tasting UI synchronization fix

## Problem
Deleting a tasting from a card updated localStorage, but other `useTastings()` hook instances on the same page kept stale React state. The card disappeared only after trying to open it or after another navigation caused a re-render.

## Fix
`useLocalStorage` now:
- reads the latest persisted value before every functional update;
- dispatches a same-tab custom event after a write;
- listens for that custom event in every hook instance;
- still listens to the native `storage` event for changes from other tabs.

This keeps Home, cards, details, statistics, profile, backup and other screens synchronized immediately after add, update or delete actions.
