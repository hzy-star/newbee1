// 策略接口的type定义
export interface createorupdate {
  id?: number
  name: string
  ruleFile: string
  returnType: string
}
// 接口返回值
export interface dataType<T = any> {
  code: number;
  data: T;
  errMsg?: string;
  success?: boolean;
}

// 策略相关类型
export interface Strategy {
  id?: number
  name: string
  ruleFile: string
  returnType: string
  description?: string // 新增描述字段
  deviceSource?: string // 新增设备来源字段
  status?: 'enabled' | 'disabled' // 新增状态字段
  eventType?: 'click' | 'imp' | 'all' // 新增事件类型字段
}
