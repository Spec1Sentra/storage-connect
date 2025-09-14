1) Open Jules / Google IDX, create a new Expo project and replace files with the code from this repo.
2) In Firebase console: create a new project. Enable Authentication (Google & Email), Firestore (start in test mode then add rules), and Storage.
3) Add Firebase config into `firebaseConfig.js`.
4) Deploy optional Cloud Functions (see `functions/index.js`) for Stripe payments. Set STRIPE_SECRET in functions env.
5) In Jules, run `npm install` then `npm start`.
6) For mobile: use Expo Go or build with EAS for App Store / Play Store.

This repo is set up for mobile-first UX and optimized for swiping interactions and offline-friendly Firestore sync.
