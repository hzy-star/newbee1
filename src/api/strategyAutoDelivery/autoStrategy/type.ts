export interface createorupdateFlow {
  id?: number
  name: string
  status: string
  pkgName: string
  country: string
  os: string
  strategyGroupIds: string
  cutoff: number
  start: number
  formula: string
  end: number
  operator: string
}

export interface createorupdateGroup {
  id?: number
  name: string
  strategyIds: string
  returnType: string
  operator: string
  status: string
  cutoff: any
  formula: string
}