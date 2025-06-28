import { clsx } from 'clsx'

type MenuItemProps = {
  icon: React.ReactNode
  text?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const MenuItem = ({
  icon,
  text,
  className,
  children,
  disabled,
  ...props
}: MenuItemProps) => {
  return (
    <button
      {...props}
      disabled={disabled}
      className={clsx(
        'flex items-center space-x-3 px-4 py-2 rounded-md w-full transition-colors duration-200 text-third hover:bg-gray-800',
        className,
        {
          'cursor-not-allowed opacity-50': disabled,
          ':hover:bg-none': !disabled,
        },
      )}
    >
      <div className="text-primary">{icon}</div>
      <span>{text || children}</span>
    </button>
  )
}

export default MenuItem
