// 菜单中英文翻译映射表
// key: 路由 name，value: { zh: 中文, en: 英文 }

const menuTranslations: Record<string, { zh: string; en: string }> = {
  // 登录
  login: { zh: '登录', en: 'Login' },
  // 首页
  newbee: { zh: 'HOMEPAGE', en: 'HOMEPAGE' },
  // 任务管理
  task: { zh: '任务管理', en: 'Task' },
  Pushtask: { zh: '实时任务', en: 'Pushtask' },
  Pushtask1: { zh: 'Pushtask1', en: 'Pushtask1' },
  Pulltask: { zh: 'pulltask', en: 'Pulltask' },
  Autotask: { zh: '自动实时任务', en: 'Autotask' },
  Autopkgtask: { zh: '离线任务', en: 'Autopkgtask' },
  devicequery: { zh: 'RTA数据监控', en: 'RtaDataMonitor' },
  algtask: { zh: '算法任务列表', en: 'AlgTask' },
  // 算法自动送量平台
  strategyAutoDelivery: { zh: '算法自动送量平台', en: 'AutoDeliveryPlatform' },
  algConfig: { zh: '设备筛选模块', en: 'DeviceFilter' },
  parameterModule: { zh: '设备参数模块', en: 'DeviceParameters' },
  parameterAssembly: { zh: '参数装配模块', en: 'ParameterAssembly' },
  parameterRules: { zh: '参数规则模块', en: 'ParameterRules' },
  washVolume: { zh: '自动化洗量', en: 'AutoWashVolume' },
  otherConfig: { zh: '其他配置', en: 'OtherConfig' },
  // 流量监控
  traffic: { zh: '流量监控', en: 'Traffic' },
  pushtaskchart: { zh: '实时任务报表', en: 'PushTaskChart' },
  Pulltaskchart: { zh: 'PullTaskChart', en: 'Pulltaskchart' },
  deviceChart: { zh: '流量报表', en: 'DeviceChart' },
  deviceDup: { zh: '重复设备统计', en: 'DeviceDup' },
  pkgTaskChart: { zh: '综合任务报表', en: 'PkgTaskChart' },
  // OSS通用平台
  docDownload: { zh: 'OSS通用平台', en: 'OSSPlatform' },
  ossDownload: { zh: '文件下载', en: 'FileDownload' },
  generalCsvEditing: { zh: 'CSV配置页面', en: 'CSVConfig' },
  // 统计页面
  dataPresentation: { zh: '统计页面', en: 'STATISTICS' },
  dataStatistics: { zh: '代理点击数统计(按天)', en: 'ProxyStatistics' },
  pullDevice: { zh: 'EsPullDevice', en: 'EsPullDevice' },
  gAgencyToStoreRate: { zh: '代理到店率统计', en: 'AgencyStoreRate' },
  trafficStatistics: { zh: '实时流量统计', en: 'GatewayDeviceStatistics' },
  syncAsyncWarn: { zh: '同步异步效果对比', en: 'SyncAsyncWarn' },
  clickhouseDevice: { zh: '离线设备查询', en: 'ClickHouseDevice' },
  offerInquiry: { zh: 'offer信息查询', en: 'OfferInquiry' },
  blackWhiteList: { zh: '黑白名单设置', en: 'BlackWhiteList' },
  // 其他设置
  setting: { zh: '其他设置', en: 'SETTING' },
  filterRule: { zh: '过滤规则', en: 'FilterRule' },
  KvConfig: { zh: '程序配置表', en: 'KVConfig' },
  AdvtrafficSplit: { zh: '广告主优先配置', en: 'AdvTrafficSplit' },
  User: { zh: '用户app权限管理', en: 'User' },
  UserManagement: { zh: '用户管理', en: 'UserManagement' },
}

/**
 * 根据路由 name 和当前语言获取菜单标题
 * @param routeName 路由的 name
 * @param lang 'zh' | 'en'
 * @param fallbackTitle 兜底标题（原始 meta.title）
 */
export function getMenuTitle(routeName: string, lang: 'zh' | 'en', fallbackTitle: string): string {
  const entry = menuTranslations[routeName]
  if (entry) {
    return entry[lang]
  }
  return fallbackTitle
}
