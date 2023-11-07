export type ApiRes<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
