import type { ProjectsSlice } from '@/types/projects'
import { StateCreator } from 'zustand'

export const createProjectsSlice: StateCreator<
  ProjectsSlice,
  [],
  [],
  ProjectsSlice
> = (set, get) => ({
  projects: [],
  setProjects: (projects) => {
    set({
      projects: projects,
      selectedprojectDetails: null,
      selectedProjectAdmins: [],
    })
  },
  addNewProject: (newProject) => {
    set({
      projects: [newProject, ...get().projects],
    })
  },
  selectedprojectDetails: null,
  setSelectedProjectDetails: (project) => {
    set({
      selectedprojectDetails: project,
    })
  },
  selectedProjectAdmins: [],
  setSelectedProjectAdmins: (users) => {
    set({
      selectedProjectAdmins: users,
    })
  },
})
