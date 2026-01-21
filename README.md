# StudyByEnergy

> A calm web app that helps students study with less guilt by treating rest as a valid study action.

## Project Description

StudyByEnergy is a minimal web app built to help undergraduate and graduate students study with emotional safety and clarity. Unlike typical productivity tools, StudyByEnergy treats rest as a first-class action and encourages energy-based choices over pressure-driven hustle culture.

**Core Philosophy**: Rest is not the opposite of productivity — it's part of it.

## Problem Statement

Traditional productivity apps often foster guilt, anxiety, and pressure through:
- Gamification elements (points, badges, levels)
- Streak counters that make you feel bad for missing a day
- Language implying you're "not doing enough"
- Lack of recognition for rest and recovery

This fuels unhealthy study habits and contributes to student burnout, especially in high-stress academic environments.

## Solution Overview

StudyByEnergy reimagines study sessions as a balance between focused tasks and intentional rest.

### Key Features

1. **Energy Check-In**
   - Students start by honestly assessing their current energy level
   - Three simple options: Low, Medium, High
   - No judgment, just awareness

2. **Context-Aware Recommendations**
   - App suggests study or rest actions based on your energy
   - Low energy? Rest is recommended first
   - High energy? Great time for deep work
   - Medium? Balanced approach

3. **Rest as Action**
   - Rest is never penalized or hidden
   - Treated as a legitimate, productive choice
   - Gentle messaging that reinforces self-care

4. **Session Persistence**
   - Your choices persist across browser reloads
   - Uses localStorage for simple, privacy-friendly storage
   - No accounts, no tracking, no data collection

5. **Optional Reflection Chat (Placeholder)**
   - Future feature for journaling and reflection
   - Space to process learning experiences
   - Placeholder implemented for hackathon MVP

## Technical Architecture

### Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (calm color palette)
- **Icons**: Lucide React (minimal, friendly icons)
- **State Management**: React Hooks + localStorage
- **Type Safety**: TypeScript strict mode
- **Cloud Sync (Optional)**: Supabase for cross-device session storage

### Design Principles
- **Calm Design**: Soft colors, generous spacing, no dark patterns
- **No Gamification**: Zero streaks, points, or pressure metrics
- **Emotional Safety**: Language that validates rest and self-care
- **Accessibility**: Semantic HTML, clear contrast, keyboard navigation
- **Privacy First**: No external APIs, no user tracking, local-only data

### Project Structure
```
study-by-energy/
├── src/
│   ├── App.tsx               # Main application component
│   ├── App.css               # Component styles
│   ├── main.tsx              # React entry point
│   ├── index.css             # Global styles with Tailwind
│   ├── components/
│   │   └── CloudSync.tsx     # Optional cloud sync UI
│   └── lib/
│       └── supabase.ts       # Supabase client (optional)
├── public/                   # Static assets
├── index.html                # HTML entry point
├── .env.example              # Environment variables template
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
└── package.json              # Dependencies and scripts
```

## Optional Cloud Sync

**Design Decision: Never Block Core Usage**

StudyByEnergy works perfectly without any cloud features. All core functionality runs locally in your browser. Cloud sync is completely optional and designed to be non-intrusive.

### Privacy-First Cloud Features

If you choose to enable cloud sync:
- ✅ **No Analytics**: We don't track your behavior or collect metrics
- ✅ **No Third-Party Tracking**: No cookies, pixels, or trackers
- ✅ **Minimal Data**: Only essential session info (energy level, activity choice, duration, optional feedback)
- ✅ **User Control**: Sign out anytime, data stops syncing
- ✅ **Graceful Degradation**: If sync fails, app continues working locally

### How Cloud Sync Works

1. **Optional Authentication**
   - Small cloud icon appears in bottom-right corner
   - Click to see sign-in option
   - Magic link via email (no password needed)
   - Can be closed and ignored entirely

2. **Conditional Syncing**
   - Only syncs if you're signed in
   - Never blocks the UI or disrupts your flow
   - Fails silently if offline or not configured
   - Local storage always works as backup

3. **What Gets Synced**
   ```typescript
   {
     energy_level: 'low' | 'medium' | 'high',
     activity: 'study' | 'rest' | 'reflect',
     duration_minutes: number,
     feedback: string,  // optional
     created_at: timestamp
   }
   ```

### Setting Up Cloud Sync (Optional)

If you want to enable cross-device sync:

```bash
# 1. Create free Supabase project at https://supabase.com
# 2. Copy .env.example to .env
cp .env.example .env

# 3. Add your Supabase credentials to .env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. Run the database migration (see .env.example for SQL)
# 5. Restart dev server
npm run dev
```

**Without these environment variables, the app works exactly the same using only local storage.**

## User Stories

### Energy Check-In Flow
- **As a student**, I want to check in with my energy level so I can make informed decisions about studying or resting.
- **As a student**, I want to feel seen and validated, not judged for having low energy.

### Activity Selection
- **As a student**, I want to receive gentle, context-aware recommendations based on my current state.
- **As a student**, I want to choose rest without guilt or penalty when I need it.
- **As a student**, I want to study when I have the energy, knowing it's my choice.

### Session Continuity
- **As a student**, I want my session to persist if I accidentally close the browser.
- **As a student**, I want to start a new check-in whenever I'm ready.

### Future Reflection
- **As a student**, I want to reflect on my study patterns and energy over time.
- **As a student**, I want to learn what conditions help me study best.

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
# Clone the repository
git clone https://github.com/mohammedabdullahcs/study-by-energy.git
cd study-by-energy

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint for code quality
```

### Deployment
The app is a static SPA and can be deployed to any static hosting service:
- Vercel, Netlify, GitHub Pages
- Simply run `npm run build` and deploy the `dist/` folder

## Team Information

**Solo Full-Stack Developer**: Mohammed Abdullah

### Hackathon Learning Journey
This project represents a learning journey focused on:
- Building humane technology that prioritizes user wellbeing
- Creating calm, pressure-free interfaces
- Challenging productivity culture's harmful patterns
- Rapid prototyping with modern web tools (React, Vite, Tailwind)
- Understanding the intersection of technology and mental health

### Development Timeline
- Conceptualization and planning
- README and technical architecture
- React + Vite project setup
- Core feature implementation (energy check-in, recommendations, persistence)
- Calm UI design with Tailwind
- Testing and refinement

## Future Roadmap

### Phase 1 (Current MVP)
- ✅ Energy check-in system
- ✅ Context-aware recommendations
- ✅ Rest as a first-class action
- ✅ Session persistence (localStorage)
- ✅ Optional cloud sync (Supabase)
- ✅ Timer with presets and custom duration
- ✅ Ambient visuals during sessions
- ✅ Optional gentle feedback
- ✅ Reflection chat placeholder

### Phase 2 (Post-Hackathon)
- [ ] Reflection journaling feature
- [ ] Simple data visualization (energy patterns)
- [ ] Mobile app optimization
- [ ] Dark mode for night studying
- [ ] Pomodoro-style timer (optional, non-pressuring)

### Phase 3 (Future Vision)
- [ ] Anonymous community insights (aggregated patterns)
- [ ] Export journal entries
- [ ] Integration with calendar apps
- [ ] Accessibility improvements (screen readers, reduced motion)

## Design Constraints

### What We Avoid
- ❌ No gamification (points, badges, achievements)
- ❌ No streaks or "days missed" counters
- ❌ No pressure language ("must," "should," "behind")
- ❌ No social comparison or leaderboards
- ❌ No constant notifications or interruptions
- ❌ No analytics or behavior tracking (even in cloud sync)
- ❌ No third-party cookies or data sharing
- ❌ No forced account creation or sign-up walls

### What We Embrace
- ✅ Clarity and simplicity
- ✅ Emotional safety and validation
- ✅ User autonomy and choice
- ✅ Privacy and data ownership
- ✅ Calm, minimal aesthetics

## Acknowledgments

Built with care for students who deserve rest. Inspired by the need for more humane productivity tools in academic spaces.

## License

MIT License - Feel free to use, modify, and distribute with attribution.
