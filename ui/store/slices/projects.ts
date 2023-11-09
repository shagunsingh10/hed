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
  getProjectById: async (id) => {
    const cachedProject = sessionStorage.getItem(id);
    if (cachedProject) return JSON.parse(cachedProject);
    const res = await fetcher.get(`/api/projects/${id}`);
    const resData = await res.json();
    return resData.data;
  },
  createProject: async (data) => {
    const res = await fetcher.post<CreateProjectData>("/api/projects", data);
    const resData = await res.json();
    set({
      projects: [...get().projects, resData.data],
    });
  },
});
