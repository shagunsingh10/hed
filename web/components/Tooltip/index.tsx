import { ReactNode, useState } from 'react'
import styles from './tooltip.module.scss'

const Tooltip = ({ text, children }: { text: string; children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false)

  const handleMouseEnter = () => {
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  return (
    <div
      className={styles.tooltipContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && <div className={styles.tooltip}>{text}</div>}
    </div>
  )
}

export default Tooltip
