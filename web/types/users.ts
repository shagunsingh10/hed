export interface User {
  id: number
  name: string
  email: string
  image?: string
}

export interface UsersSlice {
  users: User[]
  setUsers: (users: User[]) => void
}
