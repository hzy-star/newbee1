
// 接口返回值
export interface dataType<T = any> {
  success?: boolean;
  message?: string;
  data: T;
}
