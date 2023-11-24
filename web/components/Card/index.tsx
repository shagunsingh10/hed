import { BORDER_RADIUS, COLOR_CARD } from '@/constants'

const Card = ({ children }: { children: any }) => {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: COLOR_CARD,
        borderRadius: BORDER_RADIUS,
        height: '100%',
        width: '100%',
        position: 'relative',
        boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.3)',
      }}
    >
      {children}
    </div>
  )
}

export default Card
