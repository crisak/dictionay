interface TagOptionProps extends React.HTMLAttributes<HTMLSpanElement> {
  show?: boolean
}

export default function TagOption({
  children,
  show,
  ...props
}: TagOptionProps) {
  if (!show) {
    return null
  }

  return (
    <span
      {...props}
      className="border border-red-900/80 py-[1px] p-[3px] rounded-md text-[8pt] text-red-500 flex justify-center items-center"
    >
      {children}
    </span>
  )
}
