import {
  addUserToKgApi,
  createKgApi,
  getKgByIdApi,
  getKgMemebersApi,
  getKgsApi,
} from '@/apis/kgs'
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
  getKgById: async (kgId) => {
    return await getKgByIdApi(kgId)
  },
  createKg: async (projectId, data) => {
    const newKg = await createKgApi(projectId, data)
    if (newKg) {
      set({
        kgs: [newKg, ...get().kgs],
      })
    }
  },
  addUserToKg: async (kgId, userId, role) => {
    return await addUserToKgApi(kgId, userId, role)
  },
  getKgMembers: async (kgId) => {
    return await getKgMemebersApi(kgId)
  },
})
