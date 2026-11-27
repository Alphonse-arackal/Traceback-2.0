import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

// ============================================
// LAYOUTS
// ============================================

import MainLayout from './components/layout/MainLayout'
import AdminLayout from './components/admin/AdminLayout'
import AdminRoute from './components/admin/AdminRoute'
import AdminOverview from './components/admin/AdminOverview'
import AdminUsers from './components/admin/AdminUsers'
import AdminReports from './components/admin/AdminReports'

// ============================================
// USER PAGES
// ============================================

import Landing from './pages/Landing'
import Home from './pages/Home'
import ReportItem from './pages/ReportItem'
import FindItems from './pages/FindItems'
import YourReports from './pages/YourReports'
import Profile from './pages/Profile'
import ItemDetails from './pages/ItemDetails'
import Login from './pages/Login'

// ============================================
// SERVICES & CONTEXT
// ============================================

import { getItems, getMyReports } from './services/api'
import { AuthProvider, useAuth } from './context/AuthContext'

// ============================================
// PROTECTED ROUTE
// Only authenticated users can access
// ============================================

function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="auth-loading">
        Loading TraceBack...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// ============================================
// FORMAT BACKEND ITEM FOR FRONTEND
// ============================================

const formatItem = (item) => ({
  id: item._id,
  name: item.title,
  description: item.description,

  type:
    item.type.charAt(0).toUpperCase() +
    item.type.slice(1),

  category: item.category,
  image: item.image || '',

  location: item.location?.name || '',
  lat: item.location?.coordinates?.latitude,
  lng: item.location?.coordinates?.longitude,

  date: item.date
    ? new Date(item.date).toLocaleDateString()
    : '',

  dateInput: item.date
    ? new Date(item.date).toISOString().slice(0, 10)
    : '',

  contactName: item.contact?.name || '',
  contactPhone: item.contact?.phone || '',
  contactWhatsapp: item.contact?.whatsapp || '',
  contactEmail: item.contact?.email || '',

  status: item.status,
  createdAt: item.createdAt,
  reportedBy: item.reportedBy,
})

// ============================================
// APP ROUTES
// ============================================

function AppRoutes() {
  const {
    token,
    isAuthenticated,
    authLoading,
  } = useAuth()

  const [items, setItems] = useState([])
  const [myReports, setMyReports] = useState([])

  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ============================================
  // FETCH ALL ITEMS
  // ============================================

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        setError('')

        const backendItems = await getItems()

        setItems(backendItems.map(formatItem))
      } catch (err) {
        console.error('Failed to fetch items:', err)

        setError(err.message || 'Failed to load items')
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  // ============================================
  // FETCH MY REPORTS
  // ============================================

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !token) {
      setMyReports([])
      return
    }

    const fetchMyReports = async () => {
      try {
        const backendReports = await getMyReports(token)

        setMyReports(backendReports.map(formatItem))
      } catch (err) {
        console.error('Failed to fetch your reports:', err)

        setMyReports([])
      }
    }

    fetchMyReports()
  }, [token, isAuthenticated, authLoading])

  // ============================================
  // ADD OR UPDATE ITEM
  // ============================================

  const addItem = (backendItem) => {
    const formattedItem = formatItem(backendItem)

    setItems(current => {
      const exists = current.some(
        item => item.id === formattedItem.id
      )

      return exists
        ? current.map(item =>
            item.id === formattedItem.id
              ? formattedItem
              : item
          )
        : [formattedItem, ...current]
    })

    setMyReports(current => {
      const exists = current.some(
        item => item.id === formattedItem.id
      )

      return exists
        ? current.map(item =>
            item.id === formattedItem.id
              ? formattedItem
              : item
          )
        : [formattedItem, ...current]
    })
  }

  // ============================================
  // REMOVE DELETED ITEM
  // ============================================

  const removeItem = (itemId) => {
    setItems(current =>
      current.filter(item => item.id !== itemId)
    )

    setMyReports(current =>
      current.filter(item => item.id !== itemId)
    )

    setSelectedItem(current =>
      current?.id === itemId ? null : current
    )
  }

  // ============================================
  // SHARED PROPS
  // ============================================

  const shared = useMemo(
    () => ({
      items,
      search,
      setSearch,
      selectedItem,
      setSelectedItem,
      loading,
      error,
    }),
    [
      items,
      search,
      selectedItem,
      loading,
      error,
    ]
  )

  // ============================================
  // ROUTES
  // ============================================

  return (
    <Routes>

      {/* ======================================
          PUBLIC PAGES
      ====================================== */}

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/verify-email"
        element={<Navigate to="/login" replace />}
      />

      {/* ======================================
          SUPER ADMIN
      ====================================== */}

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout title="Overview" description="A live snapshot of activity across TraceBack.">
              <AdminOverview />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminLayout title="User Management" description="Review accounts and manage platform access.">
              <AdminUsers />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <AdminLayout title="Report Management" description="Review and moderate lost and found reports.">
              <AdminReports />
            </AdminLayout>
          </AdminRoute>
        }
      />

      {/* ======================================
          PROTECTED USER APPLICATION
      ====================================== */}

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <MainLayout
              search={search}
              setSearch={setSearch}
            >
              <Home {...shared} />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/report"
        element={
          <ProtectedRoute>
            <MainLayout
              search={search}
              setSearch={setSearch}
            >
              <ReportItem
                addItem={addItem}
                token={token}
              />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/explore"
        element={
          <ProtectedRoute>
            <MainLayout
              search={search}
              setSearch={setSearch}
            >
              <FindItems {...shared} />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/item/:id"
        element={
          <ProtectedRoute>
            <MainLayout
              search={search}
              setSearch={setSearch}
            >
              <ItemDetails items={items} />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <MainLayout
              search={search}
              setSearch={setSearch}
            >
              <YourReports
                items={myReports}
                token={token}
                removeItem={removeItem}
              />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout
              search={search}
              setSearch={setSearch}
            >
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/find"
        element={<Navigate to="/explore" replace />}
      />

      {/* ======================================
          UNKNOWN ROUTES
      ====================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  )
}

// ============================================
// ROOT APP
// ============================================

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
