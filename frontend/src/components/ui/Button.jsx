"use client"
import { motion } from "framer-motion"
import { forwardRef } from "react"

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "default",
      loading = false,
      disabled = false,
      className = "",
      as: AsComp, // new polymorphic prop
      ...props
    },
    ref,
  ) => {
    const baseClasses = "btn"
    const variants = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      accent: "btn-accent",
      ghost: "btn-ghost",
    }
    const sizes = {
      small: "btn-sm",
      default: "btn-md",
      large: "btn-lg",
    }
    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

    const content = loading ? (
      <div className="loading-dots">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    ) : (
      children
    )

    // If rendering as a custom component (e.g., Link), avoid motion props
    if (AsComp) {
      return (
        <AsComp ref={ref} className={classes} aria-disabled={disabled || loading || undefined} {...props}>
          {content}
        </AsComp>
      )
    }

    return (
      <motion.button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.985 }}
        {...props}
      >
        {content}
      </motion.button>
    )
  },
)

Button.displayName = "Button"

export default Button
