import useStore from '@/store'
import { DeleteOutlined } from '@ant-design/icons'
import { Col, message, Row } from 'antd'
import Link from 'next/link'
import { useEffect } from 'react'
import styles from './kglist.module.scss'

type KgListProps = {
  projectId: string
  kgId?: string
}

const KgListMobile: React.FC<KgListProps> = ({ projectId, kgId }) => {
  const kgs = useStore((state) => state.kgs)
  const getKgs = useStore((state) => state.getKgs)

  const deleteKg = (kgId: string) => {
    message.info('Delete feature coming soon...')
  }

  useEffect(() => {
    if (getKgs) getKgs(projectId)
  }, [getKgs])

  return (
    <div className={styles.kgInfoContainer}>
      {kgs.map((kg) => (
        <Row className={styles.kgInfoCard}>
          <Col span={23} className={styles.kgInfoTitle}>
            <Link
              href={`/projects/${projectId}/kgs/${kg.id}`}
              style={{ fontWeight: 'bold' }}
            >
              {kg.name}
            </Link>
          </Col>
          <Col span={1}>
            <DeleteOutlined onClick={() => deleteKg(kg.id)} />
          </Col>
          <div className={styles.kgCreatedBy}>
            Created by {kg.createdBy} at {kg.createdAt}
          </div>
        </Row>
      ))}
    </div>
  )
}

export default KgListMobile
