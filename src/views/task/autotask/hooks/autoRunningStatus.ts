export default function autoRunningStatus() {
    // { '0': '启动中', '2': "排队中",'3': "查询中",'4': "发送中",
    // '-1': '结束','-2': 'ES查询失败', '-3': "无设备", "-4": "无offer", "-5": "程序关闭",
    // "-6": "启动失败", "-7": "点击失败" };
    const taskStatus = [
        { label: '启动中', value: '0' },
        { label: '排队中', value: '2' },
        { label: '查询中', value: '3' },
        { label: '发送中', value: '4' },
        { label: '结束', value: '-1' },
        { label: 'ES查询失败', value: '-2' },
        { label: '无设备', value: '-3' },
        { label: '无offer', value: '-4' },
        { label: '程序关闭', value: '-5' },
        { label: '启动失败', value: '-6' },
        { label: '点击失败', value: '-7' },
        { label: '没有需要发送的offer', value: '-9' }
    ]  
    // 过滤条件
    const filterStatus = (status: string) => { 
        return taskStatus.filter((item) => item.value == status)[0].label
    }

    return {
        filterStatus
    }
}