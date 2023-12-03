import AssetReviewList from '@/layouts/review/reviewTable'
import { CheckSquareFilled } from '@ant-design/icons'
import { Typography } from 'antd'

const ReviewScreen = () => {
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <Typography.Title level={3}>
        <CheckSquareFilled style={{ marginRight: '0.5em' }} />
        Assets pending approval
      </Typography.Title>
      <AssetReviewList />
    </div>
  )
}

export default ReviewScreen
