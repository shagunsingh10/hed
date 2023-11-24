import { User } from './users'

export type CreateProjectData = {
  name: string
  description: string
  tags?: string
}

export interface Project {
  id: string
  name: string
  tags: string[]
  description: string | null
  createdBy: string
  createdAt: Date
}

export interface ProjectsSlice {
  projects: Project[]
  setProjects: (projects: Project[]) => void
  addNewProject: (project: Project) => void
  selectedprojectDetails: Project | null
  setSelectedProjectDetails: (project: Project) => void
  selectedProjectAdmins: User[]
  setSelectedProjectAdmins: (users: User[]) => void
}
