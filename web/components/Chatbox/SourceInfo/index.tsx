import { FileFilled, GithubFilled, UserOutlined } from '@ant-design/icons'
import { Avatar, Card, Modal, Tag, Typography } from 'antd'
import React, { FC, useState } from 'react'
import styles from './source.module.scss'

type SourceInfoModalProps = {
  data: Record<string, any>
}

const iconsMap: any = {
  github: <GithubFilled />,
  directory: <FileFilled />,
  wikipedia: (
    <img src="/icons/wikipedia.svg" alt="wiki" height={10} width={10} />
  ),
}

const getFileName = (metadata: any) => {
  if (metadata.assetType === 'directory') {
    return metadata.file_path.split('/').slice(-1)
  }
  return metadata.file_name || metadata.file_path
}

const getLink = (metadata: any) => {
  if (metadata.assetType === 'directory') {
    return metadata.file_path
  }

  if (metadata.assetType === 'github') {
    return (
      metadata.base_url + '/blob/' + metadata.branch + '/' + metadata.file_path
    )
  }

  if (metadata.assetType === 'wikipedia') {
    return metadata.base_url + '/wiki/' + metadata.file_path
  }

  return metadata.base_url + '/' + metadata.file_path
}

const SourceInfoModal: FC<SourceInfoModalProps> = ({ data }) => {
  const [openSourceInfo, setOpenSourceInfo] = useState(false)

  return (
    <>
      <Tag
        className={styles.sourceTag}
        onClick={() => setOpenSourceInfo(true)}
        bordered={false}
        color="#111b276F"
      >
        {iconsMap[data.assetType]}
        {' ' + getFileName(data) || 'Untitled'}
      </Tag>
      <Modal
        open={openSourceInfo}
        onCancel={() => setOpenSourceInfo(false)}
        footer={false}
      >
        <Card style={{ padding: '0 1em' }}>
          <Typography.Title level={3}>
            <a href={getLink(data)} rel="noopener noreferrer" target="_blank">
              {iconsMap[data.assetType]}
              <span style={{ marginLeft: '0.5em' }}>
                {getFileName(data) || 'Untitled'}
              </span>
            </a>
          </Typography.Title>
          <Typography.Title level={5}>Authors</Typography.Title>
          <div className={styles.authors}>
            {data.authors?.map((email: string) => (
              <>
                <Avatar icon={<UserOutlined />} size="small" />
                {email}
              </>
            ))}
          </div>
        </Card>
      </Modal>
    </>
  )
}

export default SourceInfoModal
