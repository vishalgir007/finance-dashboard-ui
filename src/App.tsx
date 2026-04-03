import { useEffect, useMemo, useState } from 'react'
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type TransactionType = 'income' | 'expense'
type UserRole = 'viewer' | 'admin'
type ThemeMode = 'light' | 'dark'

interface Transaction {
  id: string
  date: string
  description: string
  category: string
  type: TransactionType
  amount: number
}

interface StoredFilters {
  query: string
  typeFilter: 'all' | TransactionType
  categoryFilter: string
  sortBy: string
}

const STORAGE_KEY = 'finance-dashboard-transactions'
const ROLE_STORAGE_KEY = 'finance-dashboard-role'
const THEME_STORAGE_KEY = 'finance-dashboard-theme'
const FILTERS_STORAGE_KEY = 'finance-dashboard-filters'

const initialTransactions: Transaction[] = [
  { id: 'T001', date: '2026-01-03', description: 'Salary', category: 'Salary', type: 'income', amount: 5500 },
  { id: 'T002', date: '2026-01-08', description: 'Groceries', category: 'Food', type: 'expense', amount: 180 },
  { id: 'T003', date: '2026-01-11', description: 'Freelance Project', category: 'Side Income', type: 'income', amount: 1200 },
  { id: 'T004', date: '2026-01-14', description: 'Rent', category: 'Housing', type: 'expense', amount: 1500 },
  { id: 'T005', date: '2026-02-02', description: 'Salary', category: 'Salary', type: 'income', amount: 5500 },
  { id: 'T006', date: '2026-02-06', description: 'Dining Out', category: 'Food', type: 'expense', amount: 120 },
  { id: 'T007', date: '2026-02-09', description: 'Electricity Bill', category: 'Utilities', type: 'expense', amount: 140 },
  { id: 'T008', date: '2026-02-15', description: 'Gym Membership', category: 'Health', type: 'expense', amount: 60 },
  { id: 'T009', date: '2026-03-02', description: 'Salary', category: 'Salary', type: 'income', amount: 5500 },
  { id: 'T010', date: '2026-03-04', description: 'Stock Dividend', category: 'Investments', type: 'income', amount: 430 },
  { id: 'T011', date: '2026-03-07', description: 'Transport Pass', category: 'Transport', type: 'expense', amount: 85 },
  { id: 'T012', date: '2026-03-10', description: 'Internet Bill', category: 'Utilities', type: 'expense', amount: 70 },
  { id: 'T013', date: '2026-03-18', description: 'Shopping', category: 'Lifestyle', type: 'expense', amount: 260 },
  { id: 'T014', date: '2026-04-01', description: 'Salary', category: 'Salary', type: 'income', amount: 5500 },
]

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const monthLabel = new Intl.DateTimeFormat('en-US', {
  month: 'short',
})

const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b']

function toMonthKey(date: string) {
  const parsed = new Date(date)
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`
}

function downloadCsv(rows: Transaction[]) {
  const header = ['Date', 'Description', 'Category', 'Type', 'Amount']
  const csvRows = rows.map((row) => [
    row.date,
    row.description,
    row.category,
    row.type,
    String(row.amount),
  ])

  const escapedRows = [header, ...csvRows].map((line) =>
    line
      .map((cell) => `"${cell.replaceAll('"', '""')}"`)
      .join(','),
  )

  const blob = new Blob([escapedRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'transactions-export.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 12.5 12 5l8 7.5" />
      <path d="M6.5 11.2V19h11v-7.8" />
      <path d="M9.4 19v-4.1h5.2V19" />
    </svg>
  )
}

function InsightsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 18.5h12" />
      <path d="M7.5 18.5V12" />
      <path d="M12 18.5V8.5" />
      <path d="M16.5 18.5v-5.5" />
      <path d="M5 5.5h14" />
    </svg>
  )
}

function TransactionsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 7h10" />
      <path d="M7 12h10" />
      <path d="M7 17h7" />
      <path d="M5 5.5h14v13H5z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3v11" />
      <path d="m8.5 7.5 3.5-3.5 3.5 3.5" />
      <path d="M5 14.5v4h14v-4" />
    </svg>
  )
}

function ThemeIcon({ theme }: { theme: 'light' | 'dark' }) {
  return theme === 'dark' ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M13.5 5.5A7.5 7.5 0 1 0 18.5 18 9 9 0 0 1 13.5 5.5Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3v2.5" />
      <path d="M12 18.5V21" />
      <path d="m5.1 5.1 1.8 1.8" />
      <path d="m17.1 17.1 1.8 1.8" />
      <path d="M3 12h2.5" />
      <path d="M18.5 12H21" />
      <path d="m5.1 18.9 1.8-1.8" />
      <path d="m17.1 6.9 1.8-1.8" />
      <circle cx="12" cy="12" r="4.5" />
    </svg>
  )
}

function App() {
  const location = useLocation()
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      return initialTransactions
    }
    try {
      return JSON.parse(saved) as Transaction[]
    } catch {
      return initialTransactions
    }
  })

  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY)
    return saved === 'admin' ? 'admin' : 'viewer'
  })

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') {
      return saved
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const [savedFilters] = useState<StoredFilters | null>(() => {
    const saved = localStorage.getItem(FILTERS_STORAGE_KEY)
    if (!saved) {
      return null
    }
    try {
      const parsed = JSON.parse(saved) as Partial<StoredFilters>
      if (
        typeof parsed.query === 'string' &&
        (parsed.typeFilter === 'all' || parsed.typeFilter === 'income' || parsed.typeFilter === 'expense') &&
        typeof parsed.categoryFilter === 'string' &&
        typeof parsed.sortBy === 'string'
      ) {
        return {
          query: parsed.query,
          typeFilter: parsed.typeFilter,
          categoryFilter: parsed.categoryFilter,
          sortBy: parsed.sortBy,
        }
      }
      return null
    } catch {
      return null
    }
  })

  const [query, setQuery] = useState(savedFilters?.query ?? '')
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>(savedFilters?.typeFilter ?? 'all')
  const [categoryFilter, setCategoryFilter] = useState(savedFilters?.categoryFilter ?? 'all')
  const [sortBy, setSortBy] = useState(savedFilters?.sortBy ?? 'date-desc')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: '',
    category: 'Other',
    type: 'expense' as TransactionType,
    amount: '',
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem(ROLE_STORAGE_KEY, role)
  }, [role])

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const filters: StoredFilters = {
      query,
      typeFilter,
      categoryFilter,
      sortBy,
    }
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters))
  }, [query, typeFilter, categoryFilter, sortBy])

  const categories = useMemo(() => {
    const set = new Set(transactions.map((transaction) => transaction.category))
    return ['all', ...Array.from(set).sort()]
  }, [transactions])

  const modalCategoryOptions = useMemo(() => {
    const seed = form.type === 'income'
      ? ['Salary', 'Side Income', 'Investments', 'Bonus', 'Freelance', 'Other']
      : ['Food', 'Housing', 'Utilities', 'Transport', 'Health', 'Lifestyle', 'Education', 'Other']

    const existingByType = transactions
      .filter((transaction) => transaction.type === form.type)
      .map((transaction) => transaction.category)

    return Array.from(new Set([...seed, ...existingByType])).sort((a, b) => a.localeCompare(b))
  }, [transactions, form.type])

  const totals = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    const expenses = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    return {
      income,
      expenses,
      balance: income - expenses,
    }
  }, [transactions])

  const balanceTrend = useMemo(() => {
    const grouped = transactions.reduce<Record<string, { income: number; expense: number }>>((acc, transaction) => {
      const key = toMonthKey(transaction.date)
      if (!acc[key]) {
        acc[key] = { income: 0, expense: 0 }
      }
      acc[key][transaction.type] += transaction.amount
      return acc
    }, {})

    return Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Array<{ month: string; balance: number; income: number; expense: number }>>((acc, key) => {
        const monthData = grouped[key]
        const net = monthData.income - monthData.expense
        const previousBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0
        const [year, month] = key.split('-').map(Number)

        acc.push({
          month: `${monthLabel.format(new Date(year, month - 1, 1))} ${String(year).slice(-2)}`,
          balance: previousBalance + net,
          income: monthData.income,
          expense: monthData.expense,
        })

        return acc
      }, [])
  }, [transactions])

  const expenseByCategory = useMemo(() => {
    const grouped = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce<Record<string, number>>((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
        return acc
      }, {})

    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase()
    const filtered = transactions.filter((transaction) => {
      const matchQuery =
        lowerQuery.length === 0 ||
        transaction.description.toLowerCase().includes(lowerQuery) ||
        transaction.category.toLowerCase().includes(lowerQuery)
      const matchType = typeFilter === 'all' || transaction.type === typeFilter
      const matchCategory = categoryFilter === 'all' || transaction.category === categoryFilter
      return matchQuery && matchType && matchCategory
    })

    return filtered.sort((a, b) => {
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date)
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date)
      if (sortBy === 'amount-asc') return a.amount - b.amount
      return b.amount - a.amount
    })
  }, [transactions, query, typeFilter, categoryFilter, sortBy])

  const topSpendingCategories = useMemo(() => {
    return [...expenseByCategory]
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map((item) => ({
        label: item.name,
        value: currency.format(item.value),
        note: 'Total spent in this category',
        rawValue: item.value,
      }))
  }, [expenseByCategory])

  const insightsPageData = useMemo(() => {
    const topCategory = topSpendingCategories[0]
    const current = balanceTrend[balanceTrend.length - 1]
    const previous = balanceTrend[balanceTrend.length - 2]
    const expenseDelta = current && previous ? current.expense - previous.expense : 0
    const expenseDeltaPercent = previous && previous.expense > 0
      ? (expenseDelta / previous.expense) * 100
      : 0
    const burnRate = totals.income > 0 ? (totals.expenses / totals.income) * 100 : 0
    const savingsRate = totals.income > 0 ? (totals.balance / totals.income) * 100 : 0

    const recommendation =
      burnRate > 75
        ? 'Expense ratio is high. Prioritize reducing the top category this month.'
        : burnRate > 60
          ? 'Cash flow is moderate. Keep monitoring variable categories weekly.'
          : 'Expense ratio is healthy. Maintain this trend and allocate more to savings.'

    return {
      topCategory,
      current,
      previous,
      expenseDelta,
      expenseDeltaPercent,
      burnRate,
      savingsRate,
      recommendation,
    }
  }, [topSpendingCategories, balanceTrend, totals])

  const pageHeading = useMemo(() => {
    if (location.pathname === '/insights') {
      return {
        title: 'Insights',
        description: 'Analyze financial patterns, monthly momentum, and key cashflow indicators.',
      }
    }

    if (location.pathname === '/transactions') {
      return {
        title: 'Transaction',
        description: 'Search, filter, export, and manage your transaction records.',
      }
    }

    return {
      title: 'Finance Dashboard',
      description: 'Track cashflow, monitor spending, and quickly review transaction trends.',
    }
  }, [location.pathname])

  const cashFlowTrend = useMemo(() => {
    return balanceTrend.map((monthData) => ({
      month: monthData.month,
      income: monthData.income,
      expense: monthData.expense,
      netCashflow: monthData.income - monthData.expense,
    }))
  }, [balanceTrend])

  const resetForm = () => {
    setForm({
      date: new Date().toISOString().slice(0, 10),
      description: '',
      category: 'Other',
      type: 'expense',
      amount: '',
    })
    setEditingId(null)
    setIsTransactionModalOpen(false)
  }

  const handleSaveTransaction = () => {
    const parsedAmount = Number(form.amount)
    if (!form.description.trim() || !form.category.trim() || !form.date || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return
    }

    if (editingId) {
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.id === editingId
            ? {
                ...transaction,
                date: form.date,
                description: form.description.trim(),
                category: form.category.trim(),
                type: form.type,
                amount: parsedAmount,
              }
            : transaction,
        ),
      )
    } else {
      setTransactions((current) => [
        {
          id: `T${String(current.length + 1).padStart(3, '0')}`,
          date: form.date,
          description: form.description.trim(),
          category: form.category.trim(),
          type: form.type,
          amount: parsedAmount,
        },
        ...current,
      ])
    }

    resetForm()
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setForm({
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      amount: String(transaction.amount),
    })
    setIsTransactionModalOpen(true)
  }

  useEffect(() => {
    if (!sidebarOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (isTransactionModalOpen && event.key === 'Escape') {
        setIsTransactionModalOpen(false)
        return
      }

      if (event.key === 'Escape') {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [sidebarOpen, isTransactionModalOpen])

  useEffect(() => {
    const handleSidebarShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isEditable =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable

      if (isEditable) {
        return
      }

      if (event.ctrlKey && event.key.toLowerCase() === 'b') {
        event.preventDefault()
        setSidebarOpen((current) => !current)
      }
    }

    window.addEventListener('keydown', handleSidebarShortcut)
    return () => window.removeEventListener('keydown', handleSidebarShortcut)
  }, [])

  return (
    <div className={`app-frame ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <aside id="primary-sidebar" className="sidebar" aria-label="Primary navigation">
        {!sidebarOpen ? (
          <button
            className="sidebar-launcher"
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
            aria-controls="primary-sidebar"
          >
            <span className="sidebar-launcher-core" aria-hidden="true">
              <svg className="sidebar-launcher-icon" viewBox="0 0 24 24" role="presentation" focusable="false">
                <path d="M5 7.25h14" />
                <path d="M5 12h14" />
                <path d="M5 16.75h14" />
              </svg>
            </span>
          </button>
        ) : null}

        <div className="sidebar-header">
          <h2>Navigation</h2>
          <button className="sidebar-close" type="button" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            X
          </button>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/overview" onClick={() => setSidebarOpen(false)}>
            <OverviewIcon />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/insights" onClick={() => setSidebarOpen(false)}>
            <InsightsIcon />
            <span>Insights</span>
          </NavLink>
          <NavLink to="/transactions" onClick={() => setSidebarOpen(false)}>
            <TransactionsIcon />
            <span>Transactions</span>
          </NavLink>
        </nav>
      </aside>

      <div className="app-shell">
        <header className="top-bar">
          <div>
            <h1>{pageHeading.title}</h1>
            <p>{pageHeading.description}</p>
          </div>
          <div className="top-controls">
            <div className="role-switcher">
              <label htmlFor="role">Role</label>
              <select id="role" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              className="secondary theme-toggle"
              type="button"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            >
              <ThemeIcon theme={theme} />
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route
            path="/overview"
            element={
              <div className="page-stack">
                <section className="summary-grid">
                  <article className="card">
                    <p>Total Balance</p>
                    <h2>{currency.format(totals.balance)}</h2>
                  </article>
                  <article className="card positive">
                    <p>Total Income</p>
                    <h2>{currency.format(totals.income)}</h2>
                  </article>
                  <article className="card negative">
                    <p>Total Expenses</p>
                    <h2>{currency.format(totals.expenses)}</h2>
                  </article>
                </section>

                <section className="charts-grid">
                  <article className="panel">
                    <div className="panel-head">
                      <h3>Balance Trend</h3>
                      <span>Monthly cumulative balance</span>
                    </div>
                    {balanceTrend.length === 0 ? (
                      <p className="empty">No trend data available.</p>
                    ) : (
                      <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={balanceTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={(value) => `$${value}`} />
                            <Tooltip formatter={(value: unknown) => currency.format(Number(value ?? 0))} />
                            <Line type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={3} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </article>

                  <article className="panel">
                    <div className="panel-head">
                      <h3>Spending Breakdown</h3>
                      <span>Expense categories</span>
                    </div>
                    {expenseByCategory.length === 0 ? (
                      <p className="empty">No expense data available.</p>
                    ) : (
                      <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
                              {expenseByCategory.map((entry, index) => (
                                <Cell key={entry.name} fill={colors[index % colors.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: unknown) => currency.format(Number(value ?? 0))} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </article>
                </section>

                <section className="panel statistics-panel">
                  <div className="panel-head">
                    <h3>Top Spending Categories</h3>
                    <span>Highest expense categories this period</span>
                  </div>
                  <div className="statistics-chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topSpendingCategories}
                        layout="vertical"
                        barCategoryGap="20%"
                        margin={{ top: 10, right: 12, left: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                        <YAxis type="category" dataKey="label" width={130} tickLine={false} axisLine={false} />
                        <Tooltip
                          cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                          formatter={(value: unknown, _name, entry) => [entry?.payload?.value ?? value, entry?.payload?.label ?? 'Value']}
                        />
                        <Bar dataKey="rawValue" radius={[0, 12, 12, 0]} animationDuration={1100} animationEasing="ease-out">
                          {topSpendingCategories.map((entry, index) => (
                            <Cell key={entry.label} fill={colors[index % colors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="statistics-legend">
                    {topSpendingCategories.map((item, index) => (
                      <article key={item.label} className="statistics-legend-item" style={{ animationDelay: `${index * 90}ms` }}>
                        <span className="stat-dot" style={{ backgroundColor: colors[index % colors.length] }} />
                        <div>
                          <p className="stat-label">{item.label}</p>
                          <h4 className="stat-value">{item.value}</h4>
                          <p className="stat-note">{item.note}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            }
          />
          <Route
            path="/insights"
            element={
              <div className="insights-page-grid">
                <section className="panel insights-hero-panel">
                  <div className="panel-head">
                    <h3>Financial Insights</h3>
                    <span>Actionable view of your spending behavior</span>
                  </div>
                  <div className="insight-highlights">
                    <article>
                      <h4>Top Cost Driver</h4>
                      <p>
                        {insightsPageData.topCategory
                          ? `${insightsPageData.topCategory.label} • ${insightsPageData.topCategory.value}`
                          : 'No expense category available yet'}
                      </p>
                    </article>
                    <article>
                      <h4>Burn Rate</h4>
                      <p>{insightsPageData.burnRate.toFixed(0)}% of income consumed by expenses</p>
                    </article>
                    <article>
                      <h4>Savings Rate</h4>
                      <p>{insightsPageData.savingsRate.toFixed(0)}% retained from income</p>
                    </article>
                  </div>
                </section>

                <section className="panel insights-trend-panel">
                  <div className="panel-head">
                    <h3>Expense Momentum</h3>
                    <span>Month-over-month movement</span>
                  </div>
                  <div className="insight-kpis">
                    <article>
                      <h4>Current Month Expense</h4>
                      <p>{currency.format(insightsPageData.current?.expense ?? 0)}</p>
                    </article>
                    <article>
                      <h4>Monthly Change</h4>
                      <p>
                        {insightsPageData.previous
                          ? `${insightsPageData.expenseDelta >= 0 ? '+' : ''}${currency.format(insightsPageData.expenseDelta)} (${insightsPageData.expenseDeltaPercent.toFixed(1)}%)`
                          : 'Not enough data'}
                      </p>
                    </article>
                    <article>
                      <h4>Recommendation</h4>
                      <p>{insightsPageData.recommendation}</p>
                    </article>
                  </div>
                </section>

                <section className="panel insights-chart-panel">
                  <div className="panel-head">
                    <h3>Cash Flow Trend</h3>
                    <span>Monthly inflow, outflow, and net cash movement</span>
                  </div>
                  {cashFlowTrend.length === 0 ? (
                    <p className="empty">No trend data available.</p>
                  ) : (
                    <div className="chart-wrap insights-chart-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={cashFlowTrend} margin={{ top: 14, right: 8, left: 0, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `$${value}`} />
                          <Tooltip formatter={(value: unknown) => currency.format(Number(value ?? 0))} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="income"
                            name="Income"
                            stroke="#0ea5e9"
                            strokeWidth={2.8}
                            dot={false}
                            activeDot={{ r: 5 }}
                            animationDuration={950}
                            animationEasing="ease-out"
                          />
                          <Line
                            type="monotone"
                            dataKey="expense"
                            name="Expense"
                            stroke="#f97316"
                            strokeWidth={2.8}
                            dot={false}
                            activeDot={{ r: 5 }}
                            animationDuration={950}
                            animationEasing="ease-out"
                          />
                          <Line
                            type="monotone"
                            dataKey="netCashflow"
                            name="Net Cashflow"
                            stroke="#22c55e"
                            strokeWidth={3.2}
                            dot={false}
                            activeDot={{ r: 6 }}
                            animationDuration={1100}
                            animationEasing="ease-out"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </section>

                <section className="panel insights-chart-panel">
                  <div className="panel-head">
                    <h3>Income vs Expense Comparison</h3>
                    <span>Monthly side-by-side cashflow comparison</span>
                  </div>
                  {balanceTrend.length === 0 ? (
                    <p className="empty">No comparison data available.</p>
                  ) : (
                    <div className="chart-wrap insights-chart-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={balanceTrend} barCategoryGap="34%" barGap={6} margin={{ top: 14, right: 8, left: 0, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `$${value}`} />
                          <Tooltip formatter={(value: unknown) => currency.format(Number(value ?? 0))} />
                          <Legend />
                          <Bar dataKey="income" fill="#0ea5e9" barSize={14} radius={[7, 7, 0, 0]} animationDuration={1000} animationEasing="ease-out" />
                          <Bar dataKey="expense" fill="#f97316" barSize={14} radius={[7, 7, 0, 0]} animationDuration={1000} animationEasing="ease-out" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </section>
              </div>
            }
          />
          <Route path="/analytics" element={<Navigate to="/insights" replace />} />
          <Route
            path="/transactions"
            element={
              <section className="panel">
                <div className="panel-head">
                  <h3>Transactions</h3>
                  <div className="panel-head-actions">
                    <span>{filteredTransactions.length} records shown</span>
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => downloadCsv(filteredTransactions)}
                      disabled={filteredTransactions.length === 0}
                    >
                      <ExportIcon />
                      Export CSV
                    </button>
                  </div>
                </div>

                <div className="filters-grid">
                  <input
                    type="search"
                    placeholder="Search description or category"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as 'all' | TransactionType)}>
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="amount-desc">Amount High → Low</option>
                    <option value="amount-asc">Amount Low → High</option>
                  </select>
                </div>

                {role === 'admin' ? (
                  <div className="transaction-actions">
                    <button
                      className="primary add-transaction-btn"
                      type="button"
                      onClick={() => {
                        setEditingId(null)
                        setForm({
                          date: new Date().toISOString().slice(0, 10),
                          description: '',
                          category: 'Other',
                          type: 'expense',
                          amount: '',
                        })
                        setIsTransactionModalOpen(true)
                      }}
                    >
                      <PlusIcon />
                      <span>ADD</span>
                    </button>
                  </div>
                ) : (
                  <p className="viewer-note">Viewer role is read-only. Switch to Admin to add or edit transactions.</p>
                )}

                <div className="table-wrap">
                  {filteredTransactions.length === 0 ? (
                    <p className="empty">No transactions match your filters.</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Category</th>
                          <th>Type</th>
                          <th>Amount</th>
                          {role === 'admin' ? <th>Action</th> : null}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td>{transaction.date}</td>
                            <td>{transaction.description}</td>
                            <td>{transaction.category}</td>
                            <td>
                              <span className={`badge ${transaction.type}`}>{transaction.type}</span>
                            </td>
                            <td>{currency.format(transaction.amount)}</td>
                            {role === 'admin' ? (
                              <td>
                                <button className="small" type="button" onClick={() => handleEdit(transaction)}>
                                  Edit
                                </button>
                              </td>
                            ) : null}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

              </section>
            }
          />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </div>

      {role === 'admin' && isTransactionModalOpen && location.pathname === '/transactions' ? (
        <div className="transaction-modal-backdrop" role="presentation" onClick={() => setIsTransactionModalOpen(false)}>
          <div className="transaction-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="transaction-modal-head">
              <h4>{editingId ? 'Edit Transaction' : 'Add Transaction'}</h4>
              <button className="modal-close" type="button" onClick={() => setIsTransactionModalOpen(false)} aria-label="Close">
                X
              </button>
            </div>

            <div className="transaction-type-toggle">
              <button
                className={`type-chip income ${form.type === 'income' ? 'active' : ''}`}
                type="button"
                onClick={() => setForm((current) => ({ ...current, type: 'income' }))}
              >
                Income
              </button>
              <button
                className={`type-chip expense ${form.type === 'expense' ? 'active' : ''}`}
                type="button"
                onClick={() => setForm((current) => ({ ...current, type: 'expense' }))}
              >
                Expense
              </button>
            </div>

            <div className="transaction-modal-grid">
              <input
                type="text"
                placeholder="Description"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
              <input
                type="number"
                min="1"
                placeholder="Amount"
                value={form.amount}
                onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              />
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              />
              <select
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              >
                {modalCategoryOptions.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="transaction-modal-actions">
              <button className="primary" type="button" onClick={handleSaveTransaction}>
                {editingId ? 'Update' : 'Add'}
              </button>
              <button className="ghost" type="button" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
