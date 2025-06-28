import express from 'express'
import userRoutes from './routes/userRoutes'

const app = express()

// TODO: Change this to a proper env variable
// eslint-disable-next-line turbo/no-undeclared-env-vars
const PORT = process.env.PORT || 3000

// Middleware para parsear JSON
app.use(express.json())

// Ruta base
app.get('/', (req, res) => {
  res.json({ message: 'API REST con Node.js, Express y TypeScript' })
})

// Rutas de usuarios
app.use('/api/users', userRoutes)

// Iniciar el servidor
app.listen(PORT, () => {
  console.debug(`Servidor corriendo en http://localhost:${PORT}`)
})
