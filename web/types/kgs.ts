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
  members?: KgMember[]
}

export interface KgMember {
  id: number
  name: string
  role: string
  email: string
}

export interface KgsSlice {
  kgs: Kg[]
  getKgs: (projectId: string) => Promise<void>
  getKgById: (id: string) => Promise<Kg | undefined>
  createKg: (projectId: string, data: CreateKgData) => Promise<void>
  getKgMembers: (kgId: string) => Promise<KgMember[]>
  addUserToKg: (kgId: string, userId: string, role: string) => Promise<boolean>
}
