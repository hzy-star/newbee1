// algo-task列表
import { engineRequest } from '@/utils/request';
// 统一管理用户接口
enum API {
    // algo-task列表
    PKGTASKLIST_URL = '/api/algo/pkgtask/list',  //algo-task列表
    PKGTASKRUNNER_URL = '/api/algo/pkgtaskrunner/list',  //algo-task列表
}
// algo-task列表
export const reqPkgTaskUrl = (params?: Record<string, any>) => engineRequest.get<any, any>(API.PKGTASKLIST_URL, { params })
export const reqPkgTaskRunnerUrl = (id: any) => engineRequest.get<any, any>(API.PKGTASKRUNNER_URL, { params: { id } })