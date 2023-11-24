import { Kg } from '@/types/kgs'
import { PlusCircleOutlined } from '@ant-design/icons'
import { Card, Col, Empty, Row, Skeleton, Tag } from 'antd'
import { useRouter } from 'next/navigation'
import { FC, useState } from 'react'
import CreateKGForm from '../createKg'
import styles from './kggrid.module.scss'

type KgGridProps = {
  projectId: string
  kgs: Kg[]
  loading: boolean
}

const KGGrid: FC<KgGridProps> = ({ projectId, kgs, loading }) => {
  const [open, setOpen] = useState<boolean>(false)

  const { push } = useRouter()

  const handleProjectClick = (id: string) => {
    push(`/projects/${projectId}/kgs/${id}`, {
      scroll: false,
    })
  }

  return (
    <div className={styles.kgCardsContainer}>
      <div
        className={`${styles.kgCard} ${styles.createNewKg}`}
        onClick={() => setOpen(true)}
      >
        <PlusCircleOutlined style={{ fontSize: '8vh' }} />
        <span>Create New</span>
      </div>
      {kgs?.length > 0 ? (
        kgs.map((item, key) => (
          <Card
            key={key}
            className={styles.kgCard}
            onClick={() => handleProjectClick(item.id)}
          >
            <Skeleton loading={loading} avatar active>
              <Row
                style={{ display: 'flex', alignItems: 'center', padding: 0 }}
              >
                <Col span={24}>
                  <div className={styles.kgTitleContainer}>
                    <div className={styles.kgTitle}>{item.name}</div>
                    <div className={styles.kgTags}>
                      {item.tags.map((tag) => (
                        <Tag key={tag} color="blue">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <div className={styles.kgDescriptionContainer}>
                  <div className={styles.kgDescription}>
                    {item.description ||
                      'No description added for this knowledge group'}
                  </div>
                </div>
              </Row>
            </Skeleton>
          </Card>
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
      <CreateKGForm
        projectId={projectId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}

export default KGGrid
