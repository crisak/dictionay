import React from 'react'

type ButtonSize = 'xs' | 'small' | 'medium' | 'large'
type ButtonRadius = 'none' | 'small' | 'medium' | 'large' | 'full'
type ButtonColor =
  | 'disabled'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
type ButtonVariant =
  | 'solid'
  | 'faded'
  | 'bordered'
  | 'light'
  | 'flat'
  | 'ghost'
  | 'shadow'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize
  radius?: ButtonRadius
  color?: ButtonColor
  variant?: ButtonVariant
  isLoading?: boolean
}

const transform = {
  primary: 'green',
  secondary: 'purple',
  success: 'green',
  warning: 'yellow',
  danger: 'red',
} as Record<ButtonColor, string>

const baseStyles =
  'font-semibold transition-all duration-300 focus:outline-none'

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs',
  small: 'px-3 py-1.5 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-6 py-3 text-lg',
}

const radiusStyles: Record<ButtonRadius, string> = {
  none: 'rounded-none',
  small: 'rounded',
  medium: 'rounded-md',
  large: 'rounded-lg',
  full: 'rounded-full',
}

const colorStyles: Record<ButtonColor, string> = {
  disabled: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  secondary:
    'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
}

/**
 * Eliminar espacios y saltos de línea
 */
const cls = (str: string) => str.replace(/\s+/g, ' ').trim()

export const Button: React.FC<ButtonProps> = ({
  children,
  size = 'medium',
  radius = 'medium',
  color = 'primary',
  variant = 'solid',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles: Record<ButtonVariant, (color: ButtonColor) => string> = {
    solid: (c) => colorStyles[c],
    faded: (c) =>
      `bg-${transform[c]}-100 text-${transform[c]}-800 hover:bg-${transform[c]}-200`,
    bordered: (c) =>
      `border-2 border-${transform[c]}-600 text-${transform[c]}-600 hover:bg-${transform[c]}-600 hover:text-white`,
    light: (c) =>
      `bg-${transform[c]}-50 text-${transform[c]}-600 hover:bg-${transform[c]}-100`,
    flat: (c) =>
      `bg-transparent text-${transform[c]}-600 hover:bg-${transform[c]}-100`,

    ghost: (c) => {
      console.log(
        '=',
        `crisak-ghost bg-transparent text-${transform[c]}-400 hover:bg-${transform[c]}-50`,
      )
      return `crisak-ghost bg-transparent text-${transform[c]}-400 hover:bg-${transform[c]}-50`
    },
    shadow: (c) => `${colorStyles[c]} shadow-lg hover:shadow-xl`,
  }

  const buttonStyles = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${radiusStyles[radius]}
    ${variantStyles[variant](color)}
    ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `

  return (
    <button
      className={cls(buttonStyles)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center">
          <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
