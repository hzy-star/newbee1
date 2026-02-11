// 接口返回值
export interface dataType<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}