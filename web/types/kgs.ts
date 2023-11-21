export type CreateKgData = {
  projectId: string
  name: string
  description?: string
  tags?: string
}

export interface Kg {
  id: string
  projectId: string
  name: string
  tags: string[]
  description: string | null
  createdBy: string
  createdAt: string
}

export interface KgsSlice {
  kgs: Kg[]
  getKgs: (projectId: string) => void
  getKgById: (projectId: string, id: string) => Promise<Kg | undefined>
  createKg: (projectId: string, data: CreateKgData) => void
}
