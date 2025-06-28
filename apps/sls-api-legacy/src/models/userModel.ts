export interface User {
  id: number
  name: string
  email: string
}

// Base de datos simulada
export const users: User[] = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
  { id: 2, name: 'María García', email: 'maria@example.com' },
  { id: 3, name: 'Carlos López', email: 'carlos@example.com' },
]
