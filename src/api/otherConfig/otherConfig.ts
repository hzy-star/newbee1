// 策略接口
import { engineRequest } from '@/utils/request';
// 统一管理用户接口
enum API {
    // 测试engineapi
    TESTENGINE_URL = '/api/strategy/get?id=1',  //测试engineapi
}
// 测试engineapi
export const reqTestEngine = () => engineRequest.get<any>(API.TESTENGINE_URL)