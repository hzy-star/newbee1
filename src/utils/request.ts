// 封装axios
import axios from 'axios';
import { ElMessage, ElLoading } from 'element-plus';
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading';
// 扩展 AxiosRequestConfig 类型
declare module 'axios' {
  interface AxiosRequestConfig {
    isForm?: boolean;
  }
}
// 定义loading实例类型
let loadingInstance: LoadingInstance | null = null; // 用于存储 loading 实例

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API, // 基础路径上会携带/api
  timeout: 20000, // 请求超时时间
  withCredentials: true, // 确保请求携带 cookies
  headers: {
    'Content-Type': 'application/json', // 默认请求头
  }
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 显示全局 loading
    loadingInstance = ElLoading.service({
      lock: true,
      text: 'Loading...',
      background: 'rgba(0, 0, 0, 0.7)',
    });
      // 设置 Content-Type
    if (config.data instanceof FormData) {
      // 如果是 FormData 类型，让浏览器自动设置 Content-Type
      delete config.headers['Content-Type'];
    } else if (config.isForm) {
      // 如果指定了 isForm，使用 form-urlencoded
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else {
      // 默认使用 json
      config.headers['Content-Type'] = 'application/json';
    }
    // 示例：设置 token
    // const userStore = useUserStore();
    // if (userStore.token) {
    //   config.headers.token = userStore.token;
    // }

    return config;
  },
  (error) => {
    // 请求错误时关闭 loading
    if (loadingInstance) {
      loadingInstance.close();
      loadingInstance = null;
    }
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 响应成功时关闭 loading
    if (loadingInstance) {
      loadingInstance.close();
      loadingInstance = null;
    }
    return response.data;
  },
  (error) => {
    // 响应错误时关闭 loading
    if (loadingInstance) {
      loadingInstance.close();
      loadingInstance = null;
    }

    let message = error.message || '请求失败';
    // 错误状态码处理
    // let status = error.response?.status;
    // switch (status) {
    //   case 401:
    //     message = '未授权，请登录';
    //     break;
    //   case 403:
    //     message = '拒绝访问';
    //     break;
    //   case 404:
    //     message = '请求资源不存在';
    //     break;
    //   case 500:
    //     message = '服务器错误';
    //     break;
    //   default:
    //     message = '网络出现问题';
    //     break;
    // }

    ElMessage({
      message,
      type: 'error',
    });
    return Promise.reject(error);
  }
);

export default request;
