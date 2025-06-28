import { Request, Response } from 'express'
import { User, users } from '../models/userModel'

export const getUsers = (req: Request, res: Response): void => {
  res.status(200).json(users)
}

export const getUserById = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id || '')
  const user = users.find((user) => user.id === id)

  if (user) {
    res.status(200).json(user)
  } else {
    res.status(404).json({ message: 'Usuario no encontrado' })
  }
}

export const createUser = (req: Request, res: Response): void => {
  const newUser: User = {
    id: users.length + 1,
    name: req.body.name,
    email: req.body.email,
  }

  users.push(newUser)
  res.status(201).json(newUser)
}

export const updateUser = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id || '')
  const index = users.findIndex((user) => user.id === id)

  if (index !== -1) {
    users[index] = { ...users[index], ...req.body }
    res.status(200).json(users[index])
  } else {
    res.status(404).json({ message: 'Usuario no encontrado' })
  }
}

export const deleteUser = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id || '')
  const index = users.findIndex((user) => user.id === id)

  if (index !== -1) {
    const deletedUser = users.splice(index, 1)[0]
    res.status(200).json(deletedUser)
  } else {
    res.status(404).json({ message: 'Usuario no encontrado' })
  }
}
