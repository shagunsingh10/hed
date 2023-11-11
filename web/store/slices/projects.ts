import { StateCreator } from "zustand";
import type { ProjectsSlice } from "@/types/projects";
import {
  createProjectApi,
  getProjectsApi,
  getProjectByIdApi,
} from "@/apis/projects";

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
    });
  },
  getProjectById: async (id) => {
    return await getProjectByIdApi(id);
  },
  createProject: async (data) => {
    const newProject = await createProjectApi(data);
    set({
      projects: [...get().projects, newProject],
    });
  },
});
