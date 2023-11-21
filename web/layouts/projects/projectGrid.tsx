import useStore from '@/store'
import { Card, Col, Empty, Row, Skeleton, Tag } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from './projects.module.scss'

const ProjectsGrid = ({ visible }: { visible: boolean }) => {
  const [loading, setLoading] = useState(false)
  const projects = useStore((state) => state.projects)
  const getProjects = useStore((state) => state.getProjects)

  const { push } = useRouter()

  useEffect(() => {
    if (getProjects) {
      setLoading(true)
      getProjects().then(() => setLoading(false))
    }
  }, [getProjects])

  const handleProjectClick = (id: string) => {
    sessionStorage.setItem(
      id,
      JSON.stringify(projects.find((e) => e.id === id))
    )
    push(`projects/${id}`, {
      scroll: false,
    })
  }

  return (
    <div
      className={styles.projectCardsContainer}
      style={{
        opacity: `${visible ? 1 : 0}`,
        height: `${visible ? '' : '0'}`,
        padding: `${visible ? '' : '0'}`,
      }}
    >
      {projects?.length > 0 ? (
        projects.map((item, key) => (
          <Card
            key={key}
            className={styles.projectCard}
            onClick={() => handleProjectClick(item.id)}
          >
            <Skeleton loading={loading} avatar active>
              <Row
                style={{ display: 'flex', alignItems: 'center', padding: 0 }}
              >
                <Col span={24}>
                  <div className={styles.projectTitleContainer}>
                    <div className={styles.projectTitle}>{item.name}</div>
                    <div className={styles.projectTags}>
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
                <div className={styles.projectDescriptionContainer}>
                  <div className={styles.projectDescription}>
                    {item.description}
                  </div>
                </div>
              </Row>
            </Skeleton>
          </Card>
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  )
}

export default ProjectsGrid
