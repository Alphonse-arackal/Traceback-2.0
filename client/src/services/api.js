// ============================================
// API BASE URL
// Local development and production
// ============================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ============================================
// GET ALL ITEMS
// Public - fetch everyone's reports
// ============================================
export const getItems = async (filters = {}) => {
  const queryParams = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value)
    }
  })

  const url = `${API_BASE_URL}/items?${queryParams.toString()}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch items')
  }

  const data = await response.json()

  return data.items
}

// ============================================
// GET MY REPORTS
// Fetch only the logged-in user's reports
// ============================================
export const getMyReports = async (token) => {
  const response = await fetch(`${API_BASE_URL}/items/my-reports`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch your reports')
  }

  return data.items
}

// ============================================
// GET SINGLE ITEM
// ============================================
export const getItemById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/items/${id}`)

  if (!response.ok) {
    throw new Error('Failed to fetch item')
  }

  const data = await response.json()

  return data.item
}

// ============================================
// CREATE ITEM
// Authentication required
// ============================================
export const createItem = async (itemData, token) => {
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: itemData,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create item')
  }

  return data.item
}

// ============================================
// UPDATE ITEM
// Authentication required
// ============================================
export const updateItem = async (id, itemData, token) => {
  const response = await fetch(`${API_BASE_URL}/items/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: itemData,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update item')
  }

  return data.item
}

// ============================================
// DELETE ITEM
// Authentication required
// ============================================
export const deleteItem = async (id, token) => {
  const response = await fetch(`${API_BASE_URL}/items/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete item')
  }

  return data
}

// ============================================
// GOOGLE LOGIN
// ============================================
export const googleLogin = async (credential) => {
  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ credential }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Google login failed')
  }

  return data
}

// ============================================
// GET USER PROFILE
// ============================================
export const getUserProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch profile')
  }

  return data.user
}

// ============================================
// UPDATE USER PROFILE
// ============================================
export const updateUserProfile = async (token, profileData) => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile')
  }

  return data.user
}