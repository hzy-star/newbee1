export interface Flows {
  id?: number;
  name: string;
  status: string;
  pkgName: string;
  country: string;
  os: string;
  strategyGroupIds: any;
  cutoff: number;
  start: number;
  formula: string;
  end: number;
  operator: string;
  returnType?: string;
  flowType?: string; // 是否落盘
  syncFile: string;
  description?: string // 新增描述字段
  deviceSource?: string // 设备来源
  eventType?: 'click' | 'imp' | 'all' // 事件类型
}
// 接口返回值
export interface dataType<T = any> {
  code: number;
  data: T;
  errMsg?: string;
  success?: boolean;
}

// Groups相关类型
export interface Group {
  id?: number
  name: string
  strategyIds: string
  returnType: string
  operator: string
  status: string
  cutoff: number
  formula: string
}


// 策略相关类型
export interface Strategy {
  id?: number
  name: string
  ruleFile: string
  returnType: string,
  description?: string // 新增描述字段
}