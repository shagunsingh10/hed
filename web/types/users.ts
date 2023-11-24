export interface User {
  id: number
  name: string
  email: string
}

export interface UsersSlice {
  users: User[]
  loadUsers: () => Promise<void>
}
