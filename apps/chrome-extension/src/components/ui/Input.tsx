import { clsx } from 'clsx'

type InputProps = Omit<React.ComponentPropsWithoutRef<'input'>, 'size'> & {
  icon?: React.ReactNode
  size?: ButtonSize
  isLoading?: boolean
}

type ButtonSize = 'xs' | 'small' | 'medium' | 'large'

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs',
  small: 'px-3 py-1.5 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-6 py-3 text-lg',
}

export const Input = (props: InputProps) => {
  const {
    className,
    icon,
    size = 'medium',
    disabled,
    isLoading,
    ...rest
  } = props

  const baseStyles =
    'w-full px-4 py-2 bg-input border-2 border-primary/30 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary/70  hover:border-primary/50 transition text-third outline-none'

  const buttonStyles = `
  ${baseStyles}
  ${sizeStyles[size]} 
  ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  ${className}
`

  if (icon) {
    return (
      <div className="relative flex-grow">
        <input {...rest} className={clsx('pl-9 pr-4 py-2', buttonStyles)} />

        <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
          {icon}
        </span>
      </div>
    )
  }
  return <input {...rest} className={buttonStyles} />
}
