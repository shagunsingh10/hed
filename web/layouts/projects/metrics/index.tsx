import { CloudUploadOutlined, GlobalOutlined } from '@ant-design/icons'
import { Card, Col, Row, Statistic } from 'antd'
import React from 'react'

const AppMetrics: React.FC = () => (
  <Card>
    <Row gutter={16}>
      <Col span={12}>
        <Statistic
          title="Total Assets"
          value={1128}
          prefix={<GlobalOutlined />}
        />
      </Col>
      <Col span={12}>
        <Statistic
          title="Added Today"
          value={93}
          prefix={<CloudUploadOutlined />}
        />
      </Col>
    </Row>
  </Card>
)

export default AppMetrics
