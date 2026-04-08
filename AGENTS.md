<!-- BEGIN:nextjs-agent-rules -->

Project Structure

src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth routes
│   │   ├── login/          # Login page
│   │   │   └── page.tsx    # Login page component
│   │   └── register/       # Register page
│   │   │   └── page.tsx    # Register page component
│   ├── (game)/             # Game-related routes
│   │   ├── dashboard/      # Dashboard page
│   │   │   └── page.tsx    # Dashboard page component
│   │   ├── history/        # History page
│   │   │   └── page.tsx    # History page component
│   │   ├── leaderboard/    # Leaderboard page
│   │   │   └── page.tsx    # Leaderboard page component
│   │   ├── play/           # Play page
│   │   │   └── page.tsx    # Play page component
│   ├── admin/            # Admin routes
│   │   ├── days/           # Days page
│   │   │   └── page.tsx    # Days page component
│   │   ├── questions/      # Questions page
│   │   │   └── page.tsx    # Questions page component
│   │   ├── results/        # Results page
│   │   │   └── page.tsx    # Results page component
│   ├── api/                # API routes
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # Reusable components
│   ├── play/               # Play-specific components
│   │   ├── Complete.tsx
│   │   ├── Header.tsx
│   │   ├── Timer.tsx
│   │   ├── Prediction.tsx
│   │   └── Form.tsx
│   └── types/              # Shared types
├── lib/                    # Utility functions
│   ├── api.ts              # API client
│   └── utils.ts            # General utilities
├── public/                 # Static assets
└── types/                  # TypeScript types

<!-- END:nextjs-agent-rules -->
