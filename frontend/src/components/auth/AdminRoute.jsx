"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import LoadingSpinner from "../ui/LoadingSpinner"

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
