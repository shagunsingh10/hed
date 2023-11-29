import { getAssetLogsApi } from '@/apis/assets'
import { globalDateFormatParser } from '@/lib/functions'
import { CloseOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Card, message, Modal, Table, Tag, Typography } from 'antd'
import React, { FC, useEffect, useState } from 'react'

const colorMap: any = {
  INFO: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
}
type LogsModalProps = { open: boolean; onClose: () => void; assetId: string }

const LogModal: FC<LogsModalProps> = ({ open, onClose, assetId }) => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchLogs()
    }
  }, [open])

  const columns: any = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      align: 'center',
      width: '20%',
      render: (_: any, record: any) => (
        <span>{globalDateFormatParser(new Date(record.timestamp))}</span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      align: 'center',
      key: 'type',
      width: '15%',
      render: (_: any, record: any) => (
        <Tag color={colorMap[record.type]}>{record.type}</Tag>
      ),
    },
    {
      title: 'Content',
      dataIndex: 'content',
      align: 'center',
      key: 'content',
    },
  ]

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const logs = await getAssetLogsApi(assetId)
      setLogs(logs)
    } catch {
      message.error('Failed to fetch logs. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} width={'50vw'} closeIcon={false} footer={false}>
      <Card style={{ width: '100%', padding: '0.5em 0' }}>
        <span
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingLeft: '0.5em',
            marginBottom: '1em',
          }}
        >
          <Typography.Title level={4}>Asset logs</Typography.Title>
          <span
            style={{
              display: 'flex',
              gap: '1em',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              key="refresh"
              onClick={fetchLogs}
              icon={<ReloadOutlined />}
            />

            <Button
              key="close"
              type="primary"
              onClick={onClose}
              icon={<CloseOutlined />}
            />
          </span>
        </span>
        <Table
          dataSource={logs}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ y: 600 }}
        />
      </Card>
    </Modal>
  )
}

export default LogModal
