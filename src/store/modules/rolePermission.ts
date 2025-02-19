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
        setBtnShow(res:string) {
            this.showBtn = ['tom', 'jeff', 'jasmine'].includes(res)
        }
    }
})


export default RolePermission