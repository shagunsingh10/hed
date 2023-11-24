import { getAllUsers } from '@/apis/users'
import { UsersSlice } from '@/types/users'
import { StateCreator } from 'zustand'

export const createUsersSlice: StateCreator<UsersSlice, [], [], UsersSlice> = (
  set
) => ({
  users: [],
  loadUsers: async () => {
    set({
      users: await getAllUsers(),
    })
  },
})
