
// 接口返回值
export interface dataType<T = any> {
  code: number;
  data: T;
  errMsg?: string;
  success?: boolean;
}