import { getAssetDocsApi } from '@/apis/assets'
import HorizontalTimeLine from '@/components/Timeline'
import { Doc } from '@/types/assets'
import { Group, LoadingOverlay } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { IconFileFilled } from '@tabler/icons-react'
import { FC, useEffect, useState } from 'react'
import styles from './docs.module.scss'

type IAssetDocsProps = { projectId: string; assetId: string }

const AssetDocs: FC<IAssetDocsProps> = ({ projectId, assetId }) => {
  const [docs, setDocs] = useState<any>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (assetId) {
      fetchDocs(assetId)
    }
  }, [assetId])

  const fetchDocs = async (assetId: string) => {
    try {
      setLoading(true)
      const dcs = await getAssetDocsApi(projectId, assetId)
      setDocs(dcs)
    } catch {
      showNotification({
        color: 'red',
        message: 'Failed to fetch docs. Please try again later.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.docsContainer}>
      {loading ? (
        <LoadingOverlay />
      ) : (
        <div className={styles.docItems}>
          {docs.map((doc: Doc, idx: number) => (
            <div className={styles.docItem}>
              <div className={styles.docNameContainer}>
                {idx + 1}.
                <IconFileFilled size={15} />
                <span className={styles.docName}>{doc.name}</span>
              </div>
              <div className={styles.docStatus}>
                <HorizontalTimeLine items={doc.statusLog} />
              </div>
            </div>
          ))}
          {docs.length === 0 && (
            <Group justify="center" opacity={0.5}>
              No Docs
            </Group>
          )}
        </div>
      )}
    </div>
  )
}

export default AssetDocs
