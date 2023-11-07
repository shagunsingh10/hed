import { StateCreator } from "zustand";
import type { ProjectsSlice, CreateProjectData } from "types/projects";
import fetcher from "@/lib/fetcher";

export const createProjectsSlice: StateCreator<
  ProjectsSlice,
  [],
  [],
  ProjectsSlice
> = (set, get) => ({
  projects: [],
  getProjects: async () => {
    const res = await fetcher.get("/api/projects");
    const resData = await res.json();
    set({
      projects: resData.data,
    });
  },
  getProjectById: (id) => {
    return get().projects.find((e) => e.id === id);
  },
  createProject: async (data) => {
    const res = await fetcher.post<CreateProjectData>("/api/projects", data);
    const resData = await res.json();
    set({
      projects: [...get().projects, resData.data],
    });
  },
});
