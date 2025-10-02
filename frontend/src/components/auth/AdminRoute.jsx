"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import LoadingSpinner from "../ui/LoadingSpinner"

const AdminRoute = ({ children }) => {
  const { user, loading, isStaff } = useAuth() // use isStaff (admin or moderator)

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isStaff) {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
