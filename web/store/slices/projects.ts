import {
  createProjectApi,
  getProjectByIdApi,
  getProjectsApi,
} from '@/apis/projects'
import type { ProjectsSlice } from '@/types/projects'
import { StateCreator } from 'zustand'

export const createProjectsSlice: StateCreator<
  ProjectsSlice,
  [],
  [],
  ProjectsSlice
> = (set, get) => ({
  projects: [],
  getProjects: async () => {
    set({
      projects: await getProjectsApi(),
    })
  },
  getProjectById: async (id) => {
    return await getProjectByIdApi(id)
  },
  createProject: async (data) => {
    const newProject = await createProjectApi(data)
    set({
      projects: [newProject, ...get().projects],
    })
  },
})
