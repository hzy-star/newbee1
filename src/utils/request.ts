// 封装axios
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const request = axios.create({
    baseURL:import.meta.env.VITE_APP_BASE_API,//基础路径上会携带/api
    timeout: 5000 ,//请求超时时间
    withCredentials: true, // 确保请求携带 cookies
})

// 请求拦截器
request.interceptors.request.use((config) =>{
    //config配置对象，headers请求头，可以设置token
    // const userStore = useUserStore()
    // if(userStore.token){
    //     config.headers.token = userStore.token
    // }
    return config
})

// 响应拦截器
request.interceptors.response.use((response) =>{
    // 响应成功处理
    return response.data
},(error)=>{
    //响应错误处理
    let message = error.message || '请求失败'
    // let status = error.response.status;
    // switch (status){
    //     case 401:
    //         message = '未授权，请登录'
    //         break
    //     case 403:
    //         message = '拒绝访问'
    //         break
    //     case 404:
    //         message = '请求资源不存在'
    //         break
    //     case 500:
    //         message = '服务器错误'
    //         break
    //     default:
    //         message = '网络出现问题'
    //         break
    // }
    ElMessage({
        message,
        type:'error'
    })
    return Promise.reject(error)
})

export default request