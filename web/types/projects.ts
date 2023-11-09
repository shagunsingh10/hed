export type CreateProjectData = {
  name: string;
  description: string;
  tags: string;
};

export interface ProjectSlice {
  id: string;
  name: string;
  tags: string[];
  description: string | null;
  createdBy: string;
  createdAt: Date;
}

export interface ProjectsSlice {
  projects: ProjectSlice[];
  getProjects: () => void;
  getProjectById: (id: string) => Promise<ProjectSlice | undefined>;
  createProject: (data: CreateProjectData) => void;
}
