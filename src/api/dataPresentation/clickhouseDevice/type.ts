// 定义参数类型
export interface propFormInter {
    source: string;
    adx: string;
    country: string;
    os: string;
    range: 'public' | string;
    pkg_name: string;
    dimensions: string[];
}
  // 查询接口参数
  export interface paramsData {
    metrics?: string[]
    startDate: string
    endDate: string
    source?: string
    adx?: string
    country?: string
    os?: string
    pkg_name?: string
    dimensions: string[]
    range: string
    query: Query
  }
  
  export interface Query {
    startDate: string
    endDate: string
    source: string
    adx: string
    country: string
    os: string
    pkg_name: string
    range: string
  }
  