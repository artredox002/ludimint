# LUDIMINT - Complete UI Generation Prompt for v0.app

## PROJECT CONTEXT
Build a mobile-first, fully responsive Progressive Web App for **LUDIMINT** - a decentralized micro-tournament platform on Celo Sepolia testnet. This is a Next.js 14 app with TypeScript, using shadcn/ui components, Tailwind CSS, and must follow the exact design system specifications below.

## CRITICAL DESIGN SYSTEM REQUIREMENTS

### Color Palette (MUST USE EXACT HEX VALUES)
```css
/* Neutral Backgrounds */
--bg-900: #0b0f13   /* Main app background - darkest */
--bg-800: #0f161a   /* Elevated panels */
--bg-700: #162024   /* Card surfaces */

/* Text Colors */
--fg-100: #e6f0f6   /* Primary text - highest contrast */
--fg-80:  #c8d6dd   /* Secondary text */
--muted:   #93a6ad  /* Tertiary text */

/* Primary (Cool Cyan) */
--primary-500: #00d1c7
--primary-600: #00bfb6  /* DEFAULT primary */
--primary-700: #00a79f

/* Accent (Electric Violet) */
--accent-500: #a870ff
--accent-600: #945bff

/* Status Colors */
--success-500: #24d39a
--warning-500: #ffb454
--danger-500:  #ff6b6b

/* Glass Effects */
--glass-30: rgba(255,255,255,0.03)
--glass-60: rgba(255,255,255,0.06)

/* Shadows (Dark Mode) */
--shadow-1: 0 1px 2px rgba(0,0,0,0.5)
--shadow-2: 0 6px 18px rgba(0,0,0,0.6)
```

### Typography
- **Headline/UI**: Inter (variable weight) - Google Fonts
- **Display/Brand**: Sora or Poppins (rounded geometric)
- **Mono**: Inter Mono or JetBrains Mono for wallet addresses

**Type Scale:**
- Display/H1: 28px, font-weight 700, line-height 1.6
- H2: 22px, font-weight 600
- H3: 18px, font-weight 600
- Body: 16px, font-weight 400
- Small: 14px, font-weight 400
- Mono (addresses): 13px, font-weight 400, letter-spacing 0.02em

### Spacing System (8px grid)
- space-1: 4px
- space-2: 8px
- space-3: 12px
- space-4: 16px
- space-5: 24px
- space-6: 32px

### Border Radius
- sm: 6px
- md: 12px
- lg: 20px

### Breakpoints
- xs: <420px (mobile)
- sm: 420-768px (large mobile)
- md: 768-1024px (tablet)
- lg: 1024px+ (desktop)
- Max content width: 1200px centered on desktop

## ANIMATION & TRANSITION SYSTEM

**Motion Principles:**
- Respect `prefers-reduced-motion` media query
- Use `cubic-bezier(.2,.9,.3,1)` easing for all transitions
- Standard durations:
  - Micro interactions: 120ms (hover, ripple)
  - Modal transitions: 220ms
  - List item reveals: stagger 40ms per item

**Required Animations:**
- Smooth page transitions with fade-in
- Card hover effects with subtle lift (translateY -2px)
- Button active states (translateY 1px)
- Loading skeletons with shimmer effect
- Toast notifications slide-in from top
- Modal backdrop blur fade-in
- List items stagger fade-in on mount
- Progress bars with smooth width transitions
- Transaction status pulsing indicators

## TAILWIND CONFIGURATION (CRITICAL - NO ERRORS)

You MUST update `tailwind.config.js` to include:

```javascript
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-900': '#0b0f13',
        'bg-800': '#0f161a',
        'bg-700': '#162024',
        // Text
        'fg-100': '#e6f0f6',
        'fg-80': '#c8d6dd',
        'muted': '#93a6ad',
        // Primary
        primary: {
          DEFAULT: '#00bfb6',
          500: '#00d1c7',
          600: '#00bfb6',
          700: '#00a79f',
        },
        // Accent
        accent: {
          500: '#a870ff',
          600: '#945bff',
        },
        // Status
        success: '#24d39a',
        warning: '#ffb454',
        danger: '#ff6b6b',
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '24px',
        '6': '32px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.22s cubic-bezier(.2,.9,.3,1)',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(.4,0,.6,1) infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

## GLOBAL CSS UPDATES

Update `globals.css` to include:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-900: #0b0f13;
    --bg-800: #0f161a;
    --bg-700: #162024;
    --fg-100: #e6f0f6;
    --fg-80: #c8d6dd;
    --muted: #93a6ad;
    --primary-500: #00d1c7;
    --primary-600: #00bfb6;
    --primary-700: #00a79f;
    --accent-500: #a870ff;
    --accent-600: #945bff;
    --success-500: #24d39a;
    --warning-500: #ffb454;
    --danger-500: #ff6b6b;
    --glass-30: rgba(255,255,255,0.03);
    --glass-60: rgba(255,255,255,0.06);
    --shadow-1: 0 1px 2px rgba(0,0,0,0.5);
    --shadow-2: 0 6px 18px rgba(0,0,0,0.6);
    --radius-sm: 6px;
    --radius-md: 12px;
    --radius-lg: 20px;
  }
  
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-bg-900 text-fg-100 antialiased;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

@layer utilities {
  .glass-panel {
    @apply bg-bg-800/60 backdrop-blur-md border border-white/10;
  }
  
  .text-balance {
    text-wrap: balance;
  }
}
```

## COMPONENT SPECIFICATIONS

### Button Component
**Variants:** primary, secondary, ghost, icon
**States:**
- Default: bg-primary-600, text-bg-900, rounded-md
- Hover: bg-primary-500, transform translateY(-1px), shadow-lg
- Active: transform translateY(1px)
- Disabled: opacity-48, pointer-events-none
- Loading: spinner icon, disabled state
**Accessibility:** role=button, focus-visible:ring-3 ring-primary-500 outline-offset-2
**Touch target:** min-h-11 min-w-11 (44px minimum)

### Input Component
- Single-line, textarea, dropdown, wallet-address field
- Background: bg-bg-700, border: border-white/10
- Focus: ring-2 ring-primary-500
- Placeholder: text-muted
- Wallet address: monospace font, truncate with copy button

### Card Component
- Background: bg-bg-700
- Border: border border-white/10
- Rounded: rounded-md (12px)
- Shadow: shadow-2
- Hover: transform translateY(-2px), transition-all duration-120

### Badge Component
- Status badges: success, warning, danger colors
- Reputation badges: accent-500 with glow effect
- Rounded: rounded-full
- Text: text-xs font-semibold

### Skeleton Loader
- Background: bg-bg-700
- Shimmer animation using gradient
- Use for: wallet balance, transaction status, tournament cards

## REQUIRED PAGES & SCREENS

### 1. Landing Page (`/`)
**Hero Section:**
- Large "LUDIMINT" branding with gradient text effect
- Tagline: "Mobile-first micro-tournaments on Celo"
- Primary CTA: "Get Started" button
- Secondary CTA: "Browse Tournaments"
- Animated background with subtle gradient mesh
- Badge: "Built on Celo Sepolia" with Zap icon

**Features Section:**
- 3-column grid (mobile: stacked)
- Feature cards with icons: "Skill-Based", "Trustless Payouts", "MiniPay Ready"
- Each card: glass-panel effect, hover animation

**Stats Section:**
- Live stats: Active Tournaments, Total Players, Prizes Distributed
- Animated counters with number transitions

**How It Works:**
- 4-step process visualization
- Step cards with icons and descriptions
- Progress indicator

**CTA Section:**
- "Ready to Play?" with connect wallet button
- Background: subtle pattern or gradient

### 2. Browse Tournaments (`/tournaments`)
**Layout:**
- Search bar with filter icon (top)
- Filter chips: "All", "Active", "Upcoming", "Completed"
- Grid layout: 2 columns mobile, 3 tablet, 4 desktop

**Tournament Card:**
- Title, description (truncated)
- Entry fee in cUSD with token icon
- Max players / Current players (progress bar)
- Time remaining: "Commit ends in 2h 15m"
- Status badge: "Open", "Commit Phase", "Reveal Phase", "Finalized"
- CTA button: "Join" or "View Details"
- Hover: lift effect, border glow

**Empty State:**
- Illustration or icon
- "No tournaments found"
- "Create the first tournament" CTA

### 3. Tournament Detail (`/tournaments/[id]`)
**Header:**
- Tournament title (large)
- Status badge and time remaining
- Share button

**Info Section:**
- Description (expandable)
- Entry fee, max players, game type
- Commit window, reveal window timers
- Prize pool amount

**Players Section:**
- List of joined players with avatars
- Player addresses (truncated, copyable)
- Commit status indicators
- Leaderboard preview (if revealed)

**Actions:**
- "Join Tournament" button (primary, large)
- "Create Side Pool" button (secondary)
- Disabled states with tooltips

**Transaction Status:**
- If pending: show transaction hash, link to explorer
- Progress indicator: "Waiting for confirmation..."

### 4. Create Tournament (`/create`)
**Form Layout:**
- Multi-step form or single scroll
- Each field in card with label

**Fields:**
- Title (text input, required)
- Description (textarea, required)
- Entry Fee (number input, cUSD, min 0.1)
- Max Players (number, min 2, max 100)
- Game Type (dropdown: Memory, Reaction, Quiz, Custom)
- Commit Duration (hours/minutes selector)
- Reveal Duration (hours/minutes selector)
- Top K Winners (number, default 1)
- Enable Side Pool (toggle)

**Validation:**
- Real-time validation with error messages
- Submit button disabled until valid
- Gas estimate display

**Preview Section:**
- Live preview card showing how tournament will appear

### 5. Play Screen (`/tournaments/[id]/play`)
**Game Area:**
- Centered game container
- Instructions overlay (dismissible)
- Timer display (if timed game)

**Game Types:**
- Memory: Card matching game
- Reaction: Click when ready test
- Quiz: Multiple choice questions
- Custom: Placeholder for future games

**Action Bar:**
- "Submit Score" button (disabled until game complete)
- Score display
- Commit hash indicator (after submission)

**Post-Game:**
- Success message
- "Your score is committed"
- "Reveal opens in X minutes"
- Transaction hash link

### 6. Reveal Screen (`/tournaments/[id]/reveal`)
**Header:**
- "Reveal Your Score"
- Time remaining in reveal window

**Form:**
- Secret input (auto-filled from localStorage if available)
- Score display (read-only, from commit)
- "Reveal" button

**Status:**
- If revealed: "Score verified onchain"
- Rank display: "You placed X out of Y"
- Link to leaderboard

### 7. Leaderboard (`/tournaments/[id]/leaderboard`)
**Table:**
- Rank, Player (address), Score, Prize
- Highlight current user's row
- Animated entry (stagger fade-in)

**Filters:**
- Sort by: Rank, Score, Prize
- Search players

**Finalization Status:**
- If not finalized: "Waiting for reveal window to close"
- If finalized: "Winners can claim prizes"

### 8. Profile (`/profile`)
**Header:**
- Wallet address (truncated, copyable)
- Avatar/identicon
- Balance display (cUSD)

**Tabs:**
- Overview, Tournaments, Rewards, Badges

**Overview Tab:**
- Stats: Tournaments joined, Wins, Total earned
- Recent activity feed

**Tournaments Tab:**
- List of joined tournaments
- Status: Active, Completed, Won
- Links to tournament details

**Rewards Tab:**
- Transaction history
- Claimable prizes
- Withdraw button (MiniPay deeplink)

**Badges Tab:**
- NFT badge grid
- Each badge: image, name, description
- Hover: show metadata

### 9. Wallet Connect Modal
**Trigger:**
- Connect button in navbar
- Auto-opens if not connected

**Content:**
- "Connect Your Wallet" title
- Wallet options: MiniPay, WalletConnect, MetaMask, Valora
- Each option: icon, name, description
- Network indicator: "Celo Sepolia Testnet"
- Testnet faucet link if balance low

**States:**
- Connecting: spinner, "Connecting..."
- Success: "Connected" with address
- Error: error message, retry button

## WALLET INTEGRATION PATTERNS

### Connect Flow
1. User clicks "Connect Wallet"
2. Modal opens with wallet options
3. User selects wallet (MiniPay preferred)
4. Deeplink opens or WalletConnect modal
5. User approves connection
6. Address saved, balance fetched
7. Modal closes, address shown in navbar

### Transaction Flow
1. User initiates action (join, reveal, etc.)
2. Show transaction preview modal
3. Display: action, amount, gas estimate
4. "Confirm" button triggers wallet
5. Show pending state: "Transaction pending... Tx: 0x..."
6. Poll for confirmation
7. Show success: "Transaction confirmed" with explorer link
8. Update UI state

### Transaction Status Component
- Pending: pulsing indicator, "Waiting for 1 confirmation (≈12s)"
- Success: green checkmark, "Confirmed", explorer link
- Failed: red X, "Failed", error message, retry button

## RESPONSIVE DESIGN REQUIREMENTS

### Mobile (< 420px)
- Single column layouts
- Full-width cards
- Stacked buttons
- Bottom navigation (optional)
- Touch-friendly targets (min 44px)
- Reduced padding (space-3)

### Tablet (768-1024px)
- 2-column grids where appropriate
- Side-by-side forms
- Larger touch targets maintained

### Desktop (1024px+)
- Max width 1200px, centered
- 3-4 column grids
- Hover states active
- Keyboard navigation optimized

## ACCESSIBILITY REQUIREMENTS

### Must Have:
- All interactive elements: min 44x44px touch target
- Focus states: 3px ring-primary-500, outline-offset-2
- ARIA labels on all icons
- Semantic HTML (nav, main, section, article)
- Alt text on images
- ARIA live regions for transaction updates
- Keyboard navigation: Tab, Enter, Escape
- Screen reader announcements for state changes

### Color Contrast:
- Body text on bg-900: 4.5:1 minimum (fg-100 meets this)
- Large text (28px+): 3:1 minimum
- Interactive elements: clear focus indicators

## MICROCOPY & UX TEXT

### Transaction States:
- Pending: "Transaction pending. Waiting for 1 confirmation. Tx: 0x..."
- Success: "Transaction confirmed! View on explorer"
- Failed: "Transaction failed. Network error. Retry or view details."

### Tournament States:
- Commit saved: "Your score is securely committed onchain. Reveal opens in X minutes."
- Reveal success: "Score verified onchain. You placed X out of Y."
- Claim success: "Prize sent to your wallet. View transaction."

### Empty States:
- No tournaments: "No tournaments found. Be the first to create one!"
- No wallet: "Connect your wallet to start playing and earning."

### Error Messages:
- Network error: "Unable to connect to Celo network. Please check your connection."
- Insufficient balance: "Insufficient balance. Get testnet tokens from the faucet."
- Transaction rejected: "Transaction was rejected. Please try again."

## ICONS & ASSETS

### Use lucide-react for all icons:
- Zap (lightning/energy)
- Trophy (wins/rewards)
- Users (players)
- Clock (time)
- Wallet (connect)
- CheckCircle (success)
- XCircle (error)
- Loader2 (spinner)
- Copy (address copy)
- ExternalLink (explorer links)
- Share2 (share)
- Trophy (leaderboard)
- Gamepad2 (games)
- Coins (prizes)

### Always include:
- aria-label on icon-only buttons
- Size consistency (h-4 w-4 for small, h-5 w-5 for medium, h-6 w-6 for large)

## LOADING STATES

### Skeleton Loaders:
- Tournament cards: shimmer animation
- Balance: pulsing bar
- Transaction list: staggered cards

### Spinners:
- Button loading: Loader2 icon, spinning
- Page loading: centered spinner with "Loading..." text
- Transaction pending: pulsing glow effect

## ERROR HANDLING

### Error Boundaries:
- Graceful error messages
- "Something went wrong" with retry button
- Error details in development mode

### Form Validation:
- Real-time validation
- Error messages below fields
- Red border on invalid inputs
- Submit disabled until valid

### Network Errors:
- Retry button
- Fallback UI
- Clear error messages

## PERFORMANCE OPTIMIZATIONS

### Must Implement:
- Image optimization (next/image)
- Code splitting
- Lazy loading for below-fold content
- Memoization for expensive computations
- Debounced search inputs
- Virtualized lists for long tournament lists

## FINAL CHECKLIST

Before completion, ensure:
- [ ] All Tailwind classes are valid (no errors)
- [ ] All colors use design system tokens
- [ ] All animations respect prefers-reduced-motion
- [ ] All touch targets are 44px minimum
- [ ] All interactive elements have focus states
- [ ] All icons have aria-labels
- [ ] Mobile responsive on all screens
- [ ] Dark theme applied correctly (bg-900 base)
- [ ] Typography uses Inter font
- [ ] Spacing follows 8px grid
- [ ] Border radius uses design system values
- [ ] All pages have proper meta tags
- [ ] Loading states for all async operations
- [ ] Error states for all error cases
- [ ] Empty states for all empty lists
- [ ] Transaction flows show proper status
- [ ] Wallet integration patterns followed
- [ ] Accessibility requirements met

## TECHNICAL STACK REMINDERS

- Next.js 14 App Router
- TypeScript (strict mode)
- Tailwind CSS (with design tokens)
- shadcn/ui components (customized)
- lucide-react icons
- RainbowKit for wallet connection
- Wagmi for blockchain interactions
- Framer Motion (optional, for complex animations)

## GENERATION INSTRUCTIONS

Generate all pages and components following this prompt exactly. Ensure:
1. Every component uses the exact color values specified
2. All animations use the specified durations and easing
3. All spacing follows the 8px grid system
4. All typography uses Inter font with specified sizes
5. All responsive breakpoints are implemented
6. All accessibility requirements are met
7. No Tailwind errors or warnings
8. All code is production-ready and follows React best practices
9. All components are properly typed with TypeScript
10. All user flows are complete and functional

Generate a beautiful, polished, production-ready application that judges will be impressed by. Make it feel premium, smooth, and delightful to use.

