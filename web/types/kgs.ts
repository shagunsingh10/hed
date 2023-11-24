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
  setKgs: (kgs: Kg[]) => void
  addNewKg: (kg: Kg) => void
}
