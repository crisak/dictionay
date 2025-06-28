import { NextFunction, Response, Request } from 'express'

// Middleware para manejar errores asíncronos
export const asyncErrorHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
