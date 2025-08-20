// 统一管理项目用户相关的接口
import request from "@/utils/request";
import { ITaskChart} from "./type";
// 统一管理用户接口
enum API {
    TASKRESULT_URL = '/newbee/bigdata/statistic/taskresult', //JobGroup数据
}

// 暴露接口
// 查询JobGroup
export const reqTaskResultList = (param:ITaskChart) => request.post<ITaskChart,any>(API.TASKRESULT_URL, param)

