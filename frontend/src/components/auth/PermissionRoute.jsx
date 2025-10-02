"use client"

import { Navigate, useLocation } from "react-router-dom"
import LoadingSpinner from "../ui/LoadingSpinner"
import { useAuth } from "../../context/AuthContext"

const PermissionRoute = ({ children, resource, action = "view" }) => {
  const { user, loading, hasPermission } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner size="large" />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  if (!hasPermission(resource, action)) {
    return (
      <div className="pt-24 container-max section-padding">
        <div className="rounded-xl p-6 border" style={{ background: "var(--color-bg)" }}>
          <h2 className="text-xl font-semibold">Not authorized</h2>
          <p className="mt-2" style={{ color: "var(--color-muted)" }}>
            You don’t have permission to {action} {resource}.
          </p>
        </div>
      </div>
    )
  }

  return children
}

export default PermissionRoute
