export interface formatData {
    baseDate: string
    dayStep: string
    offerId: string
    appId: string
    pkgName: string
    taskId: string
    groupBy: string
    etype: string
    country: string,
    adx?: string,
    os?: string,
  }
  
  export interface paramsData {
    countryos: string; // JSON 字符串化的对象
    startday: string; // 假设是日期字符串
    step: number; // 天数步长，转换为 number
    days: string; // 计算得到的天数
    offer: string; // offer ID
    pkg: string; // 包名
    taskid: string; // 任务 ID
    groupby: string; // 分组字段
    etype: string; // 事件类型
    app: string; // 应用 ID
    country: string; // 国家代码
  }
  