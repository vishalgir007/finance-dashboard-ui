# Finance Dashboard UI

A modern finance dashboard built with React, TypeScript, and Vite. The app is designed for clear decision-making: track balances, inspect trends, manage transactions, and view actionable insights through a polished multi-page UI.

## Overview

This project provides a complete frontend dashboard experience with:

- Route-based pages: Overview, Insights, Transactions
- Rich visual analytics using Recharts
- Admin and Viewer behavior modes
- Local persistence for app state and preferences
- A responsive, colorful UI with animated interactions

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Recharts
- CSS (custom theme system with light and dark modes)

## Setup Instructions

### Prerequisites

- Node.js 18+ (recommended)
- npm 9+

### 1) Install dependencies

```bash
npm install
```

### 2) Start development server

```bash
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`). Open it in your browser.

### 3) Production build

```bash
npm run build
```

### 4) Preview production build (optional)

```bash
npm run preview
```

## Project Approach

The implementation follows a practical, product-style frontend approach:

1. Define core financial data model and derive all dashboard metrics from transactions.
2. Use route-based navigation so each major workflow lives on its own page.
3. Keep interaction state local and predictable with React hooks.
4. Persist user-critical state (transactions, filters, role, theme) in localStorage.
5. Build chart-driven analytics that degrade gracefully when data is missing.
6. Refine UX with role-aware actions, modal workflows, keyboard interactions, and responsive layouts.

This keeps the app easy to maintain while still feeling feature-rich and production-ready.

## Feature Explanation

### 1) Overview Page

- Summary cards for Total Balance, Total Income, and Total Expenses
- Balance trend line chart for monthly cumulative movement
- Spending breakdown pie chart by expense category
- Top spending categories section with animated horizontal bars and supporting KPI cards

### 2) Insights Page

- Financial highlight cards (top cost driver, burn rate, savings rate)
- Expense momentum block with month-over-month change and recommendation
- Cash Flow Trend line chart showing income, expense, and net cash flow
- Income vs Expense Comparison grouped bar chart with theme-matched colors

### 3) Transactions Page

- Search by description/category
- Filter by type and category
- Sort by newest/oldest and amount high/low
- Export currently filtered rows to CSV
- Empty-state handling when filters produce no results

### 4) Role-Based Actions

- Viewer: read-only mode
- Admin: can create and edit transactions

### 5) Add/Edit Transaction Modal

- Opened through the Add action button
- Full-page blur backdrop for focus
- Vertical form flow: description, amount, date, category
- Income/Expense type chips with contextual color cues
- Category options adapt to selected transaction type

### 6) Navigation and Layout

- Sliding left sidebar with icon-based navigation links
- Dedicated route content area (no section-jump navigation)
- Route-aware page headings and descriptions
- Mobile-friendly responsive behavior

### 7) Theme and Visual Design

- Professional colorful theme with gradients, accents, and icon styling
- Dark mode support with persistent user preference
- Consistent visual tokens (surface, border, text, accent colors)
- Smooth transitions and chart/element animations

### 8) Persistence

Persisted in localStorage:

- Transactions
- Selected role
- Selected theme
- Active filters and sorting

This ensures the dashboard restores user context after refresh.

## Scripts

- `npm run dev`: start dev server
- `npm run build`: type-check and production build
- `npm run preview`: preview built app




