import { CameraOutlined, SendOutlined, SmileOutlined } from '@ant-design/icons'
import { Button, Col, Input, Row } from 'antd'
import React from 'react'

const ChatMessage = () => {
  return (
    <div>
      {/* Textarea */}
      <Input.TextArea
        placeholder="Type your message..."
        autoSize={{ minRows: 3, maxRows: 3 }}
        style={{ marginBottom: 8, borderBottom: '1px solid #ccc' }}
        suffix={
          <Button
            type="primary"
            icon={<SendOutlined />}
            style={{ height: '100%' }}
          />
        }
      />

      {/* Icons Row */}
      <Row gutter={8} justify="space-between">
        <Col>
          <SmileOutlined style={{ fontSize: 24, color: '#08c' }} />
        </Col>
        <Col>
          <CameraOutlined style={{ fontSize: 24, color: '#08c' }} />
        </Col>
      </Row>
    </div>
  )
}

export default ChatMessage
