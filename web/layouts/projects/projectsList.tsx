import useStore from '@/store'
import { List, Skeleton, Tag } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from './projects.module.scss'

const ProjectsList = ({ visible }: { visible: boolean }) => {
  const [loading, setLoading] = useState(false)
  const projects = useStore((state) => state.projects)
  const getProjects = useStore((state) => state.getProjects)

  const { push } = useRouter()

  useEffect(() => {
    if (getProjects) {
      setLoading(true)
      getProjects().finally(() => setLoading(false))
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
      className={styles.projectList}
      style={{
        opacity: `${visible ? 1 : 0}`,
        height: `${visible ? '' : '0'}`,
      }}
    >
      <List
        itemLayout="horizontal"
        dataSource={projects}
        renderItem={(item, index) => (
          <Skeleton
            loading={loading}
            avatar
            active
            style={{ padding: '2em 0' }}
          >
            <List.Item
              key={index}
              style={{ padding: '2em 0' }}
              className={styles.listItem}
            >
              <List.Item.Meta
                avatar={
                  <img
                    src="/images/project-icon.jpg"
                    alt="project"
                    height={70}
                    width={70}
                    style={{ borderRadius: '0.5em' }}
                  />
                }
                title={
                  <div className={styles.projectTitleContainer}>
                    <div
                      className={styles.projectTitle}
                      onClick={() => handleProjectClick(item.id)}
                    >
                      {item.name}
                    </div>
                    <div className={styles.projectTags}>
                      {item.tags.map((tag) => (
                        <Tag key={tag} color="#434343">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </div>
                }
                description={
                  <div className={styles.projectDescriptionContainer}>
                    <div className={styles.projectDescription}>
                      {item.description}
                    </div>
                  </div>
                }
              />
            </List.Item>
          </Skeleton>
        )}
      />
    </div>
  )
}

export default ProjectsList
