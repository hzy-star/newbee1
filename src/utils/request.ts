// 封装axios
import axios from 'axios';
import { ElMessage, ElLoading } from 'element-plus';
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading';

// 扩展 AxiosRequestConfig 类型
declare module 'axios' {
  interface AxiosRequestConfig {
    isForm?: boolean;
    noloading?: boolean; // 是否不显示loading
  }
}

// 定义loading实例类型
let loadingInstance: LoadingInstance | null = null; // 用于存储 loading 实例

// 公共配置（除了 baseURL 之外）
const commonConfig = {
  timeout: 30000,
  withCredentials: true,
} as const;

// 1）newbee 用的 axios 实例：保留 baseURL = /api
const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API, // 比如 /api
  headers: {
    'Content-Type': 'application/json',
  },
  ...commonConfig,
});

// 2）engine 用的 axios 实例：不设置 baseURL
const engineRequest = axios.create({
  // 不要 baseURL，路径写 /engineapi/... 让 Vite 代理
  baseURL: import.meta.env.VITE_APP_ENGINE_API, // 比如 /api
  headers: {
    'pushtoken': 'ba366405fe4f41b1b7f3f431d442dbbf',
  },
  ...commonConfig,
});

// ===== 公共拦截器逻辑封装成函数，给两个实例都用 =====
function setupInterceptors(instance: typeof request) {
  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      if (!config.noloading) {
        // 显示全局 loading
        loadingInstance = ElLoading.service({
          lock: true,
          text: 'Loading...',
          background: 'rgba(0, 0, 0, 0.7)',
        });
      }
      // 设置 Content-Type
      if (config.data instanceof FormData) {
        // 如果是 FormData 类型，让浏览器自动设置 Content-Type
        if (config.headers) {
          // axios v1 里 headers 可能是 AxiosHeaders 对象
          // 用 delete (as any) 简单粗暴处理一下
          delete (config.headers as any)['Content-Type'];
        }
      } else if (config.isForm) {
        if (config.headers) {
          (config.headers as any)['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      } else {
        if (config.headers) {
          (config.headers as any)['Content-Type'] = 'application/json';
        }
      }
      return config;
    },
    (error) => {
      if (loadingInstance) {
        loadingInstance.close();
        loadingInstance = null;
      }
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      if (loadingInstance) {
        loadingInstance.close();
        loadingInstance = null;
      }
      // 处理二进制流响应（下载文件）
      if (response.config.responseType === 'blob') {
        return response; // 返回完整响应对象
      }
      return response.data;
    },
    (error) => {
      if (loadingInstance) {
        loadingInstance.close();
        loadingInstance = null;
      }

      let message = error.message || '请求失败';

      ElMessage({
        message,
        type: 'error',
      });
      return Promise.reject(error);
    }
  );
}

// 给两个实例都挂上同样的拦截器
setupInterceptors(request);
setupInterceptors(engineRequest);

// 默认导出：老 newbee 接口用
export default request;

// 命名导出：engine 接口专用
export { engineRequest };