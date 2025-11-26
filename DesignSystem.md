LudiMint — Dark atomic design system (production-ready)

Short name for the system: LudiMint DS (Dark) — Ludi = play, Mint = payments/rewards (miniPay friendly). Use this name internally; you can change the product name separately.

1. Design principles (1 sentence each)

Clarity first: readable, high-contrast dark surfaces that prioritise legibility.

Playful restraint: subtle micro-interactions that feel rewarding, not noisy.

Atomic and reusable: atoms → molecules → organisms → templates → pages.

Mobile-first, accessible, and performance-minded for low-bandwidth contexts.

Decentralised-ready: UI patterns for wallet flows, transaction states, and on-chain confirmations.

2. Design tokens (CSS variables / JSON tokens)
Colour palette (dark-first, all hex have WCAG-contrast friendly pairings)
:root {
  /* Neutral */
  --bg-900: #0b0f13;   /* main app background */
  --bg-800: #0f161a;   /* elevated panels */
  --bg-700: #162024;   /* card surfaces */
  --fg-100: #e6f0f6;   /* primary text */
  --fg-80:  #c8d6dd;   /* secondary text */
  --muted:   #93a6ad;  /* tertiary text */

  /* Primary (cool cyan) */
  --primary-500: #00d1c7;
  --primary-600: #00bfb6;
  --primary-700: #00a79f;

  /* Accent 1 (electric violet) */
  --accent-500: #a870ff;
  --accent-600: #945bff;

  /* Success / Warning / Error */
  --success-500: #24d39a;
  --warning-500: #ffb454;
  --danger-500:  #ff6b6b;

  /* Glass / overlay */
  --glass-30: rgba(255,255,255,0.03);
  --glass-60: rgba(255,255,255,0.06);

  /* Elevation shadows (subtle for dark mode) */
  --shadow-1: 0 1px 2px rgba(0,0,0,0.5);
  --shadow-2: 0 6px 18px rgba(0,0,0,0.6);

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  /* Spacing scale (px) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
}

3. Typography (pairing + scale)

Headline / UI: Inter (variable) — excellent legibility on small screens.

Display / Brand: Sora or Poppins (rounded geometric for character).

Accent / Mono: Inter Mono or JetBrains Mono for code/wallet addresses.

Type scale (mobile-first):

Display / H1: 28px / 700 (1.6 line-height)

H2: 22px / 600

H3: 18px / 600

Body: 16px / 400

Small: 14px / 400

Mono (addresses): 13px / 400, letter-spacing: 0.02em

Accessibility: keep body ≥ 16px and ensure 4.5:1 contrast for body and 3:1 for large text.

4. Spacing & layout

Base grid: 8px system (spacing tokens above).

Max content width (mobile): full width; tablet/desktop: 1200px centered.

Mobile breakpoints:

xs: <420px

sm: 420–768px

md: 768–1024px

lg: 1024+

5. Atomic component library
Atoms

Buttons: primary, secondary, ghost, icon; states: default / hover / active / disabled / loading.

Inputs: single-line, textarea, dropdown, wallet-address field (copy icon + block truncation).

Icons: use lucide-react or custom 2-tone SVGs; always include aria-label.

Avatars, badges, toasts, skeleton loaders.

Molecules

Input + action (search bar with icon button)

Card header (avatar, title, status pill)

Mini transaction item (amount, direction icon, timestamp, tx hash link)

Organisms

Wallet connect modal (connect wallet, select provider, network status)

Game/action panel (play button, leaderboard, reward meter)

Prediction flow (select market → place stake → confirm tx → waiting screen)

Templates / Pages

Onboarding (connect wallet → verify testnet funds → tutorial)

Home / Discover (feed of playable markets/games)

Project page (game/prediction detail + play CTA)

Profile / Wallet (portfolio, rewards history, withdrawals)

6. Component specs — example: Primary Button (atom)

Props:

label, icon?, loading?, onClick, disabled?
States:

default: background --primary-600, text --bg-900

hover: background --primary-500 (slightly lighter)

active: transform: translateY(1px)

disabled: opacity: 0.48; pointer-events:none;

Accessibility:

role=button, aria-pressed if toggle

keyboard focus outline: 3px ring --primary-500 with outline-offset: 2px

7. Dark UI patterns (specifics)

Use slightly bluish backgrounds to reduce eye strain (--bg-900).

Soft glass panels for overlays: backdrop-filter: blur(6px) and --glass-30.

Neon accent sparingly (badges, progress, micro-interaction).

Use skeleton loaders for network calls (wallet balance, tx status).

8. Motion system (micro-interactions)

Reduce motion preference: respect prefers-reduced-motion.

Standard durations:

micro: 120ms (hover, small ripple)

modal transitions: 220ms

content list reveal: stagger 40ms per item

Easing: cubic-bezier(.2,.9,.3,1) — snappy but soft.

9. Accessibility checklist (must pass)

Contrast: body text >= 4.5:1 on background; big titles >= 3:1.

Focus states: visible, at least 3px contrast ring.

Touch targets: min 44x44px.

Screen reader: meaningful alt texts, aria-live for transaction updates.

Transaction flows: show explicit confirmation IDs and estimated time.

10. Tokens → Tailwind example (snippet)
// tailwind.config.js (excerpt)
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-900': '#0b0f13',
        primary: {
          DEFAULT: '#00bfb6',
          500: '#00d1c7',
          700: '#00a79f'
        },
        accent: {
          500: '#a870ff'
        },
        success: '#24d39a',
        danger: '#ff6b6b'
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px'
      },
      spacing: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '24px' }
    }
  }
}

11. React / React Native implementation notes

Use a theme provider (styled-components, Emotion, or native Appearance on RN).

Keep tokens as a single source: export JSON tokens and generate CSS vars.

Use react-native-gesture-handler + react-navigation for mobile flows.

For icons & lightweight UI use lucide-react-native or react-native-svg.

Wallet integration: @celo-tools/use-contractkit (web) and WalletConnect mobile flows.

12. UX flows & microcopy examples (critical for hackathon judging)
Wallet onboarding flow (mobile)

Welcome screen: "Connect your wallet to play and earn."

Connect options: WalletConnect / Valora / Celo extension.

Show testnet faucet link (or auto-get test funds via faucet button).

Confirm balances and show "Ready to Play" CTA.

Microcopy: show clear error states:

"Transaction pending — waiting for 1 confirmation (≈12s)"

"Transaction failed — network error. Retry or view details."

Prediction market place flow

Select market → choose stake amount (show USD & cUSD equivalent) → show odds/fee → "Place prediction" → wallet confirmation → success screen with tx hash and share button.

13. Decentralised architecture notes (for judges)

Smart contracts on Celo testnet: reward distribution contract, market contract (for predictions), staking contract for play-to-earn.

Payments: integrate MiniPay for low-fee in-app transfers and rewards (mobile-first).

Storage: IPFS for static game assets / leaderboards snapshots (optional).

Security: avoid private keys in app, use wallet providers only. Thorough audit recommended for Solidity.

14. Deliverables to include in your submission (judge-ready)

Functional mobile APK / IPA or Expo build.

GitHub repo with README, setup guide, environment variables, migration scripts.

Smart contract source with unit tests (Hardhat/Truffle).

Demo video ≤ 4 minutes: (1) Connect wallet, (2) play/predict, (3) show MiniPay payment, (4) show tx and reward distribution.

Lightweight product spec + accessibility checklist.

Names — brandable, dark-playful, and minted for MiniPay games/predictions

I created a list of short, coined, easy-to-remember names. IMPORTANT: I ran a preliminary sweep across web and app-store searches for commonly-used matches. Complete legal safety (trademark clearance + domain registration + app-store availability) requires a formal check and lawyer. Below are suggestions — pick one and I will run a focused check or run a full legal/domain sweep for the winner.

Shortlist (brandable)

LudiMint — play + mint; concise, clear for play-to-earn.

MiniGami — mini + origami → playful, hints at small rewards.

PrysmPlay — prism + play; premium-feel, good for prediction markets.

TokenTrove — suggests prizes and community rewards.

PlayMint — literal and direct (may be used often).

LudiVault — game + safe; good for wallet + rewards UX.

Minterra — mint + terra (world); slightly grander brand.

Novalud — nova + ludic (playful); modern-sounding.

Mintiary — mint + library; good for learning/education track.

Wagerly — lean betting connotation (be careful re: gambling).

AethrPlay — ethereal + play; elegant, more neutral.

Stakara — stake + kara (sounds unique) — good for prediction markets.

What I found in preliminary checks

I ran short searches across web/app-store/trademark hits while preparing these names. Several obvious descriptive names (PlayMint, TokenTrove, PrysmPlay variants) have existing matches or close matches in different regions. Coined names like LudiMint, Novalud, and Stakara look promising on an initial surface search, but I cannot guarantee global trademark/domain/app-store availability without deeper checks (exact-match domain WHOIS, USPTO / EUIPO / WIPO searches, Google/Apple/Play store exact-match checks, GitHub/npm).

In other words: short, dictionary-like names are often already taken; brandable coinages are safest but still need legal clearance.

