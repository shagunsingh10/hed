import getRandomColor from '@/lib/utils/getRandomColor'
import { Kg } from '@/types/kgs'
import { Avatar, Card, Empty, Skeleton, Tag, Tooltip } from 'antd'
import { useRouter } from 'next/navigation'
import { FC } from 'react'
import styles from './kggrid.module.scss'

type KgGridProps = {
  projectId: string
  kgs: Kg[]
  loading: boolean
}

const KGGrid: FC<KgGridProps> = ({ projectId, kgs, loading }) => {
  const { push } = useRouter()

  const handleProjectClick = (id: string) => {
    push(`/projects/${projectId}/kgs/${id}`, {
      scroll: false,
    })
  }

  return (
    <div className={styles.kgCardsContainer}>
      {kgs?.length > 0 || loading ? (
        kgs.map((item, key) => (
          <Card
            key={key}
            type="inner"
            className={styles.kgCard}
            onClick={() => handleProjectClick(item.id)}
            title={<div className={styles.kgTitle}>{item.name}</div>}
          >
            <Skeleton loading={loading} avatar active>
              <div className={styles.kgTags}>
                {item.tags.map((tag) => (
                  <Tag key={tag} bordered={false} color={getRandomColor(tag)}>
                    {tag}
                  </Tag>
                ))}
              </div>
              <div className={styles.kgDescriptionContainer}>
                <div className={styles.kgDescription}>
                  {item.description || 'No description added'}
                </div>
              </div>
              <Avatar.Group className={styles.kgMembers} maxCount={4}>
                {item.members?.map((e) => (
                  <Tooltip title={`${e.name} (${e.role})`}>
                    <Avatar
                      src={<img src={e.image} referrerPolicy="no-referrer" />}
                    />
                  </Tooltip>
                ))}
              </Avatar.Group>
            </Skeleton>
          </Card>
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  )
}

export default KGGrid
