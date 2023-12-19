import { UsersSlice } from '@/types/users'
import { StateCreator } from 'zustand'

export const createUsersSlice: StateCreator<UsersSlice, [], [], UsersSlice> = (
  set
) => ({
  users: [],
  setUsers: (usrs) => {
    set({
      users: usrs,
    })
  },
})
