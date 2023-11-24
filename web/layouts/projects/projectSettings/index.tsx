import { Project } from '@/types/projects'
import { Tag } from 'antd'
import { FC } from 'react'

type IProjectSettings = {
  project: Project | null
}
const ProjectSettings: FC<IProjectSettings> = ({ project }) => {
  return project ? (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2>{project.name}</h2>
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Description:</strong>
        <p>{project.description}</p>
      </div>
      <div>
        <strong>Tags:</strong>
        <div style={{ marginTop: 8 }}>
          {project.tags.map((tag: string) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <></>
  )
}

export default ProjectSettings
