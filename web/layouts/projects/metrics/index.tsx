import { CloudUploadOutlined, GlobalOutlined } from '@ant-design/icons'
import { Card, Statistic } from 'antd'
import styles from './metrics.module.scss'

const AppMetrics: React.FC = () => (
  <Card>
    <div className={styles.metricsContainer}>
      <Statistic
        title="Total Projects"
        value={20}
        prefix={<GlobalOutlined />}
      />
      <Statistic
        title="Added Today"
        value={3}
        prefix={<CloudUploadOutlined />}
      />
      <Statistic
        title="Total Assets"
        value={1233}
        prefix={<GlobalOutlined />}
      />
      <Statistic
        title="Added Today"
        value={93}
        prefix={<CloudUploadOutlined />}
      />
      <Statistic
        title="Added Today"
        value={93}
        prefix={<CloudUploadOutlined />}
      />
      <Statistic
        title="Added Today"
        value={93}
        prefix={<CloudUploadOutlined />}
      />
    </div>
  </Card>
)

export default AppMetrics
