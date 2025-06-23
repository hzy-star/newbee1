// 关于权限按钮配置
import { defineStore } from 'pinia'

const RolePermission = defineStore('RolePermission', {
    state: () => {
        return{
            showBtn:false,//控制按钮显示
        }
    },
    actions: {
        // 控制按钮显示
        setBtnShow(res: any) {
            // this.showBtn = ['tom', 'jeff', 'jasmine','admin'].includes(res?.data?.name || '')
            this.showBtn = res?.data?.role === 'admin' || res?.data?.role === 'superAdmin'
        }
    },
    persist: true
})


export default RolePermission