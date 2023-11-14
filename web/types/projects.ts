export type CreateProjectData = {
  name: string;
  description: string;
  tags?: string;
};

export interface Project {
  id: string;
  name: string;
  tags: string[];
  description: string | null;
  createdBy: string;
  createdAt: Date;
}

export interface ProjectsSlice {
  projects: Project[];
  getProjects: () => Promise<void>;
  getProjectById: (id: string) => Promise<Project | undefined>;
  createProject: (data: CreateProjectData) => void;
}
