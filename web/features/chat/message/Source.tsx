import { Badge, Modal } from '@mantine/core'
import {
  IconBrandGithubFilled,
  IconBrandWikipedia,
  IconFileFilled,
  IconUserCircle,
} from '@tabler/icons-react'
import React, { FC, useState } from 'react'
import styles from './message.module.scss'

type SourceInfoModalProps = {
  data: Record<string, any>
}

const iconsMap: any = {
  github: <IconBrandGithubFilled size={10} />,
  directory: <IconFileFilled size={10} />,
  wikipedia: <IconBrandWikipedia size={10} />,
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
      <Badge
        size="xs"
        variant="light"
        className={styles.sourceTag}
        onClick={() => setOpenSourceInfo(true)}
      >
        {iconsMap[data.assetType]}
        {' ' + getFileName(data) || 'Untitled'}
      </Badge>
      <Modal
        opened={openSourceInfo}
        onClose={() => setOpenSourceInfo(false)}
        title={
          <a href={getLink(data)} rel="noopener noreferrer" target="_blank">
            {iconsMap[data.assetType]}
            <span style={{ marginLeft: '0.5rem' }}>
              {getFileName(data) || 'Untitled'}
            </span>
          </a>
        }
      >
        <div className={styles.authors}>
          {data.authors?.map((email: string) => (
            <>
              <IconUserCircle size={20} />
              {email}
            </>
          ))}
        </div>
      </Modal>
    </>
  )
}

export default SourceInfoModal
