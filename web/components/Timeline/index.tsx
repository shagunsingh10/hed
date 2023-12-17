// import { globalDateFormatParser } from '@/lib/utils/functions'
import { rem, ThemeIcon } from '@mantine/core'
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react'
import { FC } from 'react'
import styles from './timeline.module.scss'

const successIcon = (
  <ThemeIcon color="teal" size={16} radius="xl">
    <IconCircleCheck style={{ width: rem(12), height: rem(12) }} />
  </ThemeIcon>
)

const failureIcon = (
  <ThemeIcon color="red" size={16} radius="xl">
    <IconCircleX style={{ width: rem(12), height: rem(12) }} />
  </ThemeIcon>
)

type TimelineItem = {
  error: boolean
  status: string
  timestamp: Date
  message: string | null
}

type ITimelinePorps = {
  items: TimelineItem[]
}

const HorizontalTimeLine: FC<ITimelinePorps> = ({ items }) => {
  return (
    <div className={styles.timeline}>
      {items.map((item, idx) => (
        <>
          {idx !== 0 && <span>→</span>}
          <div className={styles.timelineItem}>
            {item.error ? failureIcon : successIcon}
            <div className={styles.details}>
              <span className={styles.timelineStatus}>{item.status}</span>
              {/* <span className={styles.timelineTimestamp}>
              ({globalDateFormatParser(item.timestamp)})
            </span> */}
            </div>
          </div>
        </>
      ))}
    </div>
  )
}

export default HorizontalTimeLine
