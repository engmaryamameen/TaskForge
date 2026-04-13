export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly metadata?: Record<string, any>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
