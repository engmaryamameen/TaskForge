export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: {
    page?: number;
    total?: number;
  };
  error?: {
    code: string;
    message: string;
  };
}
