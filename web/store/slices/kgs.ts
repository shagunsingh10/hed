import { createKgApi, getKgByIdApi, getKgsApi } from '@/apis/kgs'
import type { KgsSlice } from '@/types/kgs'
import { StateCreator } from 'zustand'

export const createKgsSlice: StateCreator<KgsSlice, [], [], KgsSlice> = (
  set,
  get
) => ({
  kgs: [],
  getKgs: async (projectId) => {
    set({
      kgs: await getKgsApi(projectId),
    })
  },
  getKgById: async (projectId, kgId) => {
    return await getKgByIdApi(projectId, kgId)
  },
  createKg: async (projectId, data) => {
    const newKg = await createKgApi(projectId, data)
    set({
      kgs: [newKg, ...get().kgs],
    })
  },
})
