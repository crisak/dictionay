import { useGlobalStore } from '../../../store/global'

const styles = {
  containerTags: {
    display: 'flex',
    columnGap: '8px',
    flexWrap: 'wrap',
  },
  typeText: {
    color: '#9ca3af',
    fontSize: '14px',
    fontStyle: 'italic',
  },
} as const

const Tags = () => {
  const tags = useGlobalStore((state) => state.tags)
  const totalTags = tags?.length || 0

  if (!totalTags) return <div></div>

  return (
    <span style={styles.containerTags}>
      {tags?.map((tag, i) => (
        <span key={tag + i} style={{ ...styles.typeText, fontSize: 12 }}>
          {tag}
        </span>
      ))}
    </span>
  )
}

export default Tags
