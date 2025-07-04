import { Request, Response } from 'express'

interface CustomError extends Error {
  statusCode?: number
  details?: unknown
}
export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
) => {
  const statusCode = error.statusCode || 500

  // Solo registra errores diferentes a 200 y 201
  if (statusCode !== 200 && statusCode !== 201) {
    console.error(
      `[ERROR] ${req.method} ${req.path}:`,
      {
        statusCode,
        message: error.message,
        details: error.details || {},
        stack: error.stack,
        body: req.body,
        params: req.params,
        query: req.query,
      },
      '\n\nException:',
      error,
    )
  }

  res.status(statusCode).json({
    status: 'error',
    message: error.message || 'Internal Server Error',
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    ...(process.env.NODE_ENV === 'development' && { details: error.details }),
  })
}
