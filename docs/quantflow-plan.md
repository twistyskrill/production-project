## Quantflow Migration Plan

### 1. Vision

- Rebuild the legacy blog application into a high-fidelity trading SPA aligned with the provided fintech spec.
- Keep the existing FSD tooling (Webpack, Storybook, Jest) while upgrading the runtime stack (Node 20, React 18, TS 5).
- Deliver three primary experiences: trading terminal (`/terminal`), analytics hub (`/analytics`), and personalization/PWA settings (`/settings`).

### 2. Technical Stack

- **Runtime:** Node 20, React 18.3, TypeScript 5, React Router 6, Redux Toolkit + RTK Query, React Hook Form.
- **UI:** Existing shared components + new widgets, Recharts for analytics, React-Virtualized for large tables.
- **Data Layer:** In-memory mock services + WebSocket simulator, `fakeBaseQuery` powered RTK Query endpoints for orders, positions, analytics, alerts.
- **PWA:** Custom service worker with cache strategies + push notification shim, installable manifest, offline fallbacks.
- **Tooling:** ESLint (extended ruleset), Jest/RTL, Cypress smoke flows, GitHub Actions (Node 20), Docker multi-stage image.

### 3. Domain Architecture (FSD)

```
src/
├── app/ (providers, theming, router, service worker registration)
├── pages/
│   ├── TerminalPage (order form + positions + market data)
│   ├── AnalyticsPage (P&L, distribution, history, export)
│   └── SettingsPage (themes, layout, alerts, PWA toggles)
├── widgets/
│   ├── OrderPlacementPanel
│   ├── PositionsPanel
│   ├── MarketPulsePanel
│   ├── AnalyticsDashboard
│   ├── PortfolioBreakdown
│   ├── TradeHistory
│   └── AlertCenter
├── features/
│   ├── orderPlacement
│   ├── positionsFilters
│   ├── positionsTable
│   ├── marketWatch
│   ├── analyticsFilters
│   ├── exportCsv
│   ├── alerting
│   └── layoutPreferences
├── entities/
│   ├── order
│   ├── position
│   ├── instrument
│   ├── analytics
│   └── settings (user/trader profile)
└── shared/
    ├── api/mockTradingApi + mockMarketSocket
    ├── lib/performance, csv, formatters
    ├── config/i18n (EN/RU, lazy namespaces)
    └── ui primitives
```

### 4. Data & Real-Time Strategy

- **MockTradingApi** – deterministic seeds for instruments, positions (10k+), trades, benchmarks; exposes async methods with tunable latency + jitter to emulate production.
- **RTK Query** – endpoints for `getPositions`, `closePosition`, `placeOrder`, `getAnalytics`, `exportTrades`, `updateWatchlist`.
- **MockMarketSocket** – emits 50–70 ticks/sec across watchlist universe, tracks latency + connection metrics, broadcasts through `BroadcastChannel`-like pub/sub so multiple widgets can subscribe.
- **State management** – normalized slices for orders, positions filters, alerts, layout preferences; selectors for filtered/sorted/virtualized data.

### 5. Performance & UX

- Virtualized tables (react-virtualized `AutoSizer + List`) for instruments/positions/trades (10k rows, overscan tuned).
- Memoized selectors + `React.memo` widgets; suspense-friendly data hooks.
- Code-splitting per route via React.lazy in router.
- Theme-aware design (dark/light), responsive grid layouts, accessible form validation.

### 6. PWA & Notifications

- Manifest + icons, theme color, standalone display.
- Service worker:
  - Precaches critical shell.
  - Runtime cache strategies (stale-while-revalidate for mock API, cache-first for assets).
  - Offline queue for pending orders (sync replay when online).
- Push shim:
  - Local triggers driven by alert rules (price thresholds, P&L drawdowns).
  - Fallback to Notifications API when SW unavailable.

### 7. Quality & Delivery

- ESLint config extended with architectural boundaries (no cross layer imports).
- Jest/RTL tests: slices, hooks, widgets smoke tests; Cypress for terminal + analytics happy paths.
- GitHub Actions: Node 20, install, lint, unit, build, Cypress component stub.
- Dockerfile: multi-stage (builder + nginx), env vars for API URLs.

### 8. Execution Roadmap

1. **Foundation** – upgrade dependencies/tooling, add SW/manifest, update CI + Docker, refresh theming, translations.
2. **Domain Layer** – implement mock services, slices, RTK Query endpoints, selectors.
3. **Terminal Module** – order placement, confirmation workflow, virtualized positions + market feed, alerts integration.
4. **Analytics Module** – dashboards, filters, CSV export, technical indicators/backtest stubs.
5. **Settings & Customization** – layout/theme/watchlist management, push opt-in, offline toggles.
6. **Testing & Polish** – unit/UI tests, Cypress smoke, perf profiling, docs.

This plan will guide the incremental refactor until the new quantflow experience is production-ready.
