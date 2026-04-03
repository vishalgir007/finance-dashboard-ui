# Finance Dashboard UI

Frontend assessment project focused on building a clean, interactive finance dashboard using React.

## Tech Stack

- React + TypeScript + Vite
- Recharts for data visualization
- CSS for responsive UI styling
- Local storage for state persistence

## Features Implemented

### 1) Dashboard Overview
- Summary cards: Total Balance, Total Income, Total Expenses
- Time-based chart: monthly cumulative balance trend (line chart)
- Categorical chart: expense breakdown by category (pie chart)

### 2) Transactions Section
- Transaction table includes Date, Description, Category, Type, Amount
- Search by description/category
- Filter by transaction type and category
- Sorting by date and amount
- Empty state when no records match filters

### 3) Basic Role-Based UI
- Role switcher with Viewer/Admin
- Viewer: read-only access
- Admin: can add new transactions and edit existing ones

### 4) Insights Section
- Highest spending category
- Month-over-month expense comparison
- One general spending observation based on income/expense ratio

### 5) State Management
- Managed with React hooks (`useState`, `useMemo`, `useEffect`)
- State includes:
  - transactions
  - filters (search/type/category/sort)
  - selected role
  - selected theme (light/dark)
  - form/edit state for admin actions
- Data persisted to local storage:
  - transactions
  - selected role
  - selected theme
  - filters (search/type/category/sort)

### 6) UI/UX
- Clean responsive layout for desktop/tablet/mobile
- Scroll-safe table wrapper for small screens
- Graceful no-data handling for charts and transaction list

### 7) Optional Enhancements Implemented
- Dark mode toggle with persisted preference
- Smooth animations and transitions (cards, panels, controls, rows, empty states)
- Reduced-motion accessibility support (`prefers-reduced-motion`)
- CSV export for currently filtered transactions

## Getting Started

```bash
npm install
npm run dev
```

Open the local URL shown in terminal.

## Build

```bash
npm run build
```


