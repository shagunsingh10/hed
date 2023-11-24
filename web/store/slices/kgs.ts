import type { KgsSlice } from '@/types/kgs'
import { StateCreator } from 'zustand'

export const createKgsSlice: StateCreator<KgsSlice, [], [], KgsSlice> = (
  set,
  get
) => ({
  kgs: [],
  setKgs: (kgs) => {
    set({
      kgs: kgs,
    })
  },
  addNewKg: (newKg) => {
    set({
      kgs: [newKg, ...get().kgs],
    })
  },
})
