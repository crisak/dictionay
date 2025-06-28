'use client'

import { useFormatter, useNow } from 'next-intl'

export function LocalizedDateTime() {
  const now = useNow()
  const format = useFormatter()

  return (
    <div>
      <p>
        {format.dateTime(now, {
          dateStyle: 'full',
          timeStyle: 'short',
        })}
      </p>
      <p>
        {format.number(1250.99, {
          style: 'currency',
          currency: 'USD',
        })}
      </p>
    </div>
  )
}
