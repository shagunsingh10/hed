import getRandomColor from '@/lib/utils/getRandomColor'
import { Project } from '@/types/projects'
import { Avatar, Card, Empty, Skeleton, Tag } from 'antd'
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
            title={<div className={styles.projectTitle}>{item.name}</div>}
          >
            <Skeleton loading={loading} avatar active>
              <div className={styles.projectTags}>
                {item.tags.map((tag) => (
                  <Tag key={tag} bordered={false} color={getRandomColor(tag)}>
                    {tag}
                  </Tag>
                ))}
              </div>
              <div className={styles.projectDescriptionContainer}>
                <div className={styles.projectDescription}>
                  {item.description || 'No description added'}
                </div>
              </div>
              <Avatar.Group className={styles.projectMembers} maxCount={4}>
                <Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=1" />
                <Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=2" />
                <Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=3" />
                <Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=4" />
                <Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=5" />
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
