
// 接口返回值
export interface dataType<T = any> {
  code: number;
  data: T;
  errMsg?: string;
  success?: boolean;
}
export interface Groups {
  id?: number;
  name: any;
  strategyIds: string;
  returnType: string;
  operator: string;
  status: string;
  cutoff: any;
  formula: string;
}
