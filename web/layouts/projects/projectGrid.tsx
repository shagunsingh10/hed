import { Project } from '@/types/projects'
import { PlusCircleOutlined } from '@ant-design/icons'
import { Card, Col, Empty, Row, Skeleton, Tag } from 'antd'
import { useRouter } from 'next/navigation'
import { FC, useState } from 'react'
import CreateProjectForm from './newProject'
import styles from './projects.module.scss'

type KGGridProps = {
  projects: Project[]
  loading: boolean
}
const ProjectsGrid: FC<KGGridProps> = ({ projects, loading }) => {
  const [createProjectTab, setCreateProjectTab] = useState<boolean>(false)

  const { push } = useRouter()

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
    <div className={styles.projectCardsContainer}>
      <div
        className={`${styles.projectCard} ${styles.createNewProject}`}
        onClick={() => setCreateProjectTab(true)}
      >
        <PlusCircleOutlined style={{ fontSize: '8vh' }} />
        <span>Create New</span>
      </div>
      {projects?.length > 0 || loading ? (
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
                    {item.description || 'No description added'}
                  </div>
                </div>
              </Row>
            </Skeleton>
          </Card>
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
      <CreateProjectForm
        open={createProjectTab}
        closeProjectCreationForm={() => setCreateProjectTab(false)}
      />
    </div>
  )
}

export default ProjectsGrid
