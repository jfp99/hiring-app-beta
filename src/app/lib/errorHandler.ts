// lib/errorHandler.ts
import { z } from 'zod'

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational = true
  ) {
    super(message)
  }
}

export class ValidationError extends AppError {
  constructor(public errors: any[]) {
    super('Erreur de validation', 400)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Non authentifié') {
    super(message, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Non autorisé') {
    super(message, 403)
  }
}

export const handleError = (error: unknown) => {
  console.error('Error:', error)

  if (error instanceof AppError) {
    return {
      error: error.message,
      status: error.statusCode,
      ...(error instanceof ValidationError && { errors: error.errors })
    }
  }

  if (error instanceof z.ZodError) {
    return {
      error: 'Erreur de validation',
      status: 400,
      errors: error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }))
    }
  }

  return {
    error: 'Une erreur interne est survenue',
    status: 500
  }
}