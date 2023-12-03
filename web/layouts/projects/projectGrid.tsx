import getRandomColor from '@/lib/utils/getRandomColor'
import { Project } from '@/types/projects'
import { Avatar, Card, Empty, Skeleton, Tag, Tooltip } from 'antd'
import { useRouter } from 'next/navigation'
import { FC } from 'react'
import styles from './projects.module.scss'

type KGGridProps = {
  projects: Project[]
  loading: boolean
}
const ProjectsGrid: FC<KGGridProps> = ({ projects, loading }) => {
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
      {projects?.length > 0 || loading ? (
        projects.map((item, key) => (
          <Card
            key={key}
            type="inner"
            className={styles.projectCard}
            onClick={() => handleProjectClick(item.id)}
            title={
              <div className={styles.projectTitle}>
                <img src="/icons/library.svg" width={25} height={25} />
                {item.name}
              </div>
            }
          >
            <Skeleton loading={loading} avatar active>
              <div className={styles.projectTags}>
                {item.tags.map((tag) => (
                  <Tag key={tag} color={getRandomColor(tag)}>
                    {tag}
                  </Tag>
                ))}
              </div>
              <div className={styles.projectDescriptionContainer}>
                <div className={styles.projectDescription}>
                  {item.description || 'No description added'}
                </div>
              </div>
              <Avatar.Group className={styles.projectMembers} maxCount={6}>
                {item.members?.map((e) => (
                  <Tooltip title={`${e.name}`}>
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

export default ProjectsGrid
