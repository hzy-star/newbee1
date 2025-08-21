<template>
    <div class="blacklist-white-list-page">
        <!-- 顶部搜索条件区 -->
        <div class="search-form-container">
            <el-form :inline="true" :model="searchForm" :rules="searchRules" ref="searchFormRef" class="search-form">
                <el-form-item label="thresholdName" prop="ruleFile" class="flex-item flex-ruleFile">
                    <el-select v-model="searchForm.ruleFile" placeholder="请选择" class="flex-select"
                        @change="onThresholdChange">
                        <!-- <el-option label="click" value="click" />
                        <el-option label="imp" value="imp" /> -->
                        <el-option v-for="item in thresholdList" :key="item.id" :label="item.name"
                            :value="item.ruleFile" />
                    </el-select>
                </el-form-item>
                <el-form-item label="country" prop="country" class="flex-item flex-country">
                    <el-input v-model="searchForm.country" placeholder="请输入国家" clearable class="flex-select" />
                </el-form-item>
                <el-form-item label="pkgName" prop="pkgName" class="flex-item flex-pkgName">
                    <el-input v-model="searchForm.pkgName" placeholder="请输入包名" clearable class="flex-select" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSearch">查询</el-button>
                </el-form-item>
            </el-form>
            <el-form class="search-form" :model="selectedItem" label-width="100px" v-if="selectedItem">
                <el-form-item label="returnType" prop="returnType" class="flex-item flex-returnType">
                    <el-input v-model="selectedItem.returnType" disabled class="flex-select" />
                </el-form-item>
                <el-form-item label="description" prop="description" class="flex-item flex-description">
                    <el-input v-model="selectedItem.description" disabled class="flex-select" />
                </el-form-item>
                <el-form-item label="ruleFile" prop="ruleFile" class="flex-item flex-ruleFile">
                    <el-input v-model="selectedItem.ruleFile" disabled class="flex-select" />
                </el-form-item>

            </el-form>
        </div>

        <!-- 中间表格区 -->
        <div class="table-container">
            <el-table :data="tableData" height="100%" border>
                <el-table-column type="index" :index="indexMethod" min-width="5%" align="center" />
                <el-table-column prop="country" label="country" min-width="5%" align="center" />
                <el-table-column prop="pkgName" label="pkgName" min-width="20%" align="center" />
                <el-table-column prop="threshold" label="阈值" min-width="10%" align="center" />
                <el-table-column label="操作" width="130" align="center">
                    <template #default="scope">
                        <el-button type="success" text size="small"
                            @click="openEditDialog(scope.row, 'edit')">修改</el-button>
                        <el-button type="danger" text size="small" @click="deleteBtn(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 底部按钮区 -->
        <div class="footer-btns">
            <div>
                <el-button type="danger" @click="deleteBtn(null)">删除</el-button>
                <el-button type="primary" :disabled="!tableData.length"
                    @click="openEditDialog(tableData[0], 'replace')">替换</el-button>
                <el-button type="success" @click="openEditDialog(null, 'add')">新增</el-button>
            </div>
        </div>

        <!-- 弹窗 -->
        <el-dialog :model-value="dialogVisible"
            :title="dialogType === 'replace' ? '替换阈值' : dialogType === 'edit' ? '修改阈值' : '新增阈值'" width="40vw"
            :top="'30vh'" @close="handleDialogClose">
            <el-form :model="dialogForm" :rules="dialogType==='edit' || dialogType==='add' ? dialogRules : ''" ref="dialogFormRef" label-width="120px">
                <el-row :gutter="24">
                    <el-col :span="12">
                        <el-form-item label="Name" prop="ruleFile">
                            <el-select v-model="dialogForm.ruleFile" placeholder="请选择"
                                :disabled="isDialogFieldDisabled('ruleFile')">

                                <el-option v-for="item in thresholdList" :key="item.id" :label="item.name"
                                    :value="item.ruleFile" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="country" prop="country">
                            <el-input v-model="dialogForm.country" placeholder="请输入国家" clearable
                                :disabled="isDialogFieldDisabled('country')" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="24">
                    <el-col :span="12">
                        <el-form-item label="pkgName" prop="pkgName">
                            <el-input v-model="dialogForm.pkgName" placeholder="请输入包名" clearable
                                :disabled="isDialogFieldDisabled('pkgName')" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="threshold">
                            <el-input v-model="dialogForm.threshold" placeholder="请输入阈值" clearable />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <el-button @click="handleDialogClose">取消</el-button>
                <el-button type="primary" v-if="dialogType === 'replace'"
                    @click="onDialogReplace('replace')">替换</el-button>
                <el-button type="success" v-if="dialogType === 'add'" @click="onDialogAdd">新增</el-button>
                <el-button type="success" v-if="dialogType === 'edit'" @click="onDialogReplace('edit')">修改</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reqThresholdConfigUrl, reqReplaceUrl, reqAddUrl, reqDeleteUrl } from '@/api/strategyAutoDelivery/thresholdConfig/index'
import type { StrategyThreshold } from '@/api/strategyAutoDelivery/threshold/type'
import { ThresholdPinia } from '@/store/strategyAutoDelivery/threshold'
const thresholdStore = ThresholdPinia()
import _ from 'lodash'
const searchFormRef = ref()
const dialogFormRef = ref()

// 搜索表单
const searchForm = reactive({
    ruleFile: '',
    country: '',
    pkgName: '',
})
const indexMethod = (index: number) => {
    return index + 1
}

const searchRules = {
    ruleFile: [{ required: true, message: '请选择ruleFile', trigger: 'change' }],
    country: [{
        validator: (rule: any, value: any, callback: any) => {
            if (!value && !searchForm.pkgName) {
                callback(new Error('国家或包名必须填写一个'));
            } else {
                callback();
            }
        },
        trigger: 'blur'
    }],
    pkgName: [{
        validator: (rule: any, value: any, callback: any) => {
            if (!value && !searchForm.country) {
                callback(new Error('国家或包名必须填写一个'));
            } else {
                callback();
            }
        },
        trigger: 'blur'
    }]
}

// 表格数据
const tableData = ref<any[]>([])
const saveSearchForm = ref<any>(null)
// 查询后保存搜索条件中的ruleFile
const ruleFileObj = ref<any>(null)
// 查询方法
const onSearch = async () => {
    try {
        await searchFormRef.value.validate();
        
        if (!searchForm.country && !searchForm.pkgName) {
            ElMessage.error('国家或包名必须填写一个');
            return;
        }

        saveSearchForm.value = null; // 清除保存的搜索条件
        ruleFileObj.value = null; // 清除ruleFile保存
        const res = await reqThresholdConfigUrl(searchForm);
        
        if (res.code === 200) {
            tableData.value = res.data || [];
            saveSearchForm.value = _.cloneDeep(searchForm); // 保存当前搜索条件
            ruleFileObj.value = searchForm.ruleFile; // 保存当前ruleFile
        } else {
            ElMessage.error(res.errMsg || '查询失败');
        }
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error.errMsg || '请求输入正确的查询条件');
        }
    }
};

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref<'replace' | 'add' | 'edit'>('add')
const dialogForm = reactive({
    ruleFile: '',
    country: '',
    pkgName: '',
    threshold: null,
    returnType: 'rank'
})

const dialogRules = {
    ruleFile: [{ required: true, message: '请选择阈值名称', trigger: 'change' }],
    country: [{ required: true, message: '请输入国家', trigger: 'blur' }],
    pkgName: [{ required: true, message: '请输入包名', trigger: 'blur' }],
    threshold: [
        { required: true, message: '请输入比例', trigger: 'blur' },
        {
            validator: (rule: any, value: any, callback: any) => {
                if (value === '' || value === null || value === undefined) {
                    callback(new Error('请输入比例'))
                }
                // else if (isNaN(value) || Number(value) < 0 || Number(value) > 1) {
                //     callback(new Error('比例必须是0-1之间的数字'))
                // }
                else {
                    callback()
                }
            }, trigger: 'blur'
        }
    ]
}
// 打开弹窗
const openEditDialog = (row: any, type: 'replace' | 'add' | 'edit') => {
    dialogType.value = type
    dialogVisible.value = true
    if (type === 'replace' && row) {
        // 替换时依然从搜索条件带入
        dialogForm.ruleFile = saveSearchForm.value.ruleFile || ''
        dialogForm.country = saveSearchForm.value.country   || ''
        dialogForm.pkgName = saveSearchForm.value.pkgName   || ''
        dialogForm.threshold = null // 替换时不需要阈值

    } else if ((type === 'edit') && row) {
        // 修改时所有内容从row取值
        dialogForm.ruleFile = searchForm.ruleFile || ''
        dialogForm.country = row.country || ''
        dialogForm.pkgName = row.pkgName || ''
        dialogForm.threshold = row.threshold || 1
    } else {
        // 新增时清空，默认选中click和黑阈值
        dialogForm.ruleFile = saveSearchForm.value.ruleFile
        dialogForm.country = ''
        dialogForm.pkgName = ''
        dialogForm.threshold = null
    }
}
// 关闭弹窗
const handleDialogClose = () => {
    dialogVisible.value = false
  // 先重置表单值
  dialogFormRef.value?.resetFields();
  // 再手动清除校验状态
  dialogFormRef.value?.clearValidate();
    resetDialogForm()
}
// 重置弹窗表单
const resetDialogForm = () => {
    dialogForm.ruleFile = ''
    dialogForm.country = ''
    dialogForm.pkgName = ''
    dialogForm.threshold = null

    dialogFormRef.value?.resetFields()

}
// 替换操作
const onDialogReplace = (row: string) => {
    dialogFormRef.value.validate((valid: boolean) => {
        if (!valid) return
        // 兜底校验 threshold
        const params = {
            // 必填字段（确保一定有值）
            ruleFile: dialogForm.ruleFile ?? '',
            country: dialogForm.country ?? '',
            pkgName: dialogForm.pkgName ?? '',
            threshold: dialogForm.threshold ?? '', // 默认值为1
        }
        reqReplaceUrl(params).then((res: any) => {
            if (res.code === 200) {
                ElMessage.success('替换成功！')
                dialogVisible.value = false
                onSearch() // 刷新表格
            } else {
                ElMessage.error(res.errMsg || '替换失败')
            }
        }).catch((error: any) => {
            ElMessage.error(error.errMsg || '替换失败')
        }).finally(() => {
            // 
        })
    })
}
// 新增操作
const onDialogAdd = () => {
    dialogFormRef.value.validate((valid: boolean) => {
        if (!valid) return
        reqAddUrl(dialogForm).then((res: any) => {
            if (res.code === 200) {
                ElMessage.success('新增成功！')
                dialogVisible.value = false
                onSearch() // 刷新表格
            } else {
                ElMessage.error(res.errMsg || '新增失败')
            }
        }).catch((error: any) => {
            ElMessage.error(error.errMsg || '新增失败')
        }).finally(() => {
            // 可以在这里添加任何需要的清理操作
        })
    })
}
// 删除操作
const deleteBtn = async (row?: any) => {
    try {
        // 检查是否有数据可删除
        if (!row && tableData.value.length === 0) {
            ElMessage.warning('暂无数据可删除')
            return
        }

        // 统一确认对话框
        const confirmMessage = row ? '确定要删除该记录吗？' : '确定要删除该阈值配置吗？'
        await ElMessageBox.confirm(confirmMessage, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        // 准备参数
        const params = row ? { ...row,ruleFile:ruleFileObj.value } : { ...saveSearchForm.value, ruleFile: ruleFileObj.value }

        // 执行删除
        const res = await reqDeleteUrl(params)

        if (res.code === 200) {
            ElMessage.success('删除成功！')
            onSearch() // 刷新表格
        } else {
            ElMessage.error(res.errMsg || '删除失败')
        }
    } catch (error: any) {
        // 统一处理取消和错误情况
        if (error === 'cancel' || error === 'close') {
            ElMessage.info('已取消删除操作')
        } else {
            ElMessage.error(error.errMsg || '删除失败')
        }
    }
}

// 生成弹窗字段的禁用状态
const isDialogFieldDisabled = (field: string) => {
    // if (dialogType.value === 'replace') {
    //     // 替换时：有搜索条件的字段禁用，无值可编辑
    //     return !!(saveSearchForm.value as Record<string, any>)[field]
    // }
    if (dialogType.value === 'edit' || dialogType.value === 'replace') {
        // 修改时：除了 threshold 以外的字段全部禁用
        const editableFields = ['threshold']
        return !editableFields.includes(field)
    }
    return false
}

// 获取阈值列表
const thresholdList = ref<StrategyThreshold[]>([])
// 监听 dataUpdated 状态
watch(() => thresholdStore.dataUpdated, (newVal) => {
    if (newVal) {
        // 重置状态，避免重复触发
        if (thresholdStore.ThresholdList.length === 0 && thresholdStore.dataUpdated === false) {
            thresholdStore.getThreshold()
        } else {
            thresholdList.value = thresholdStore.ThresholdList
            thresholdStore.dataUpdated = true

        }
    } else {
        if (thresholdStore.ThresholdList.length === 0 && thresholdStore.dataUpdated === false) {
            thresholdStore.getThreshold()
        }
    }
}, { immediate: true })

// 原有的监听可以保留，但可以简化
watch(() => thresholdStore.ThresholdList, (newVal) => {
  thresholdList.value = newVal
})

// 切阈值
const selectedItem = ref<any>()
const onThresholdChange = (val: string) => {
    // 这里可以根据选中的阈值名称进行其他操作
    selectedItem.value = thresholdList.value.find(item => item.ruleFile === val);
    console.log('选中的完整对象:', selectedItem.value);
}
</script>

<style scoped lang="scss">
.blacklist-white-list-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - $base-tabbar-height - 80px);
    box-sizing: border-box;

    // 顶部
    .search-form-container {
        flex-shrink: 0;
        padding: 12px 0 0 0;

        .search-form {
            display: flex;
            flex-wrap: wrap;
            gap: 12px 0;
            align-items: flex-start;

            .flex-item {
                margin-right: 12px;

                .flex-select {
                    width: 100%;
                }
            }

            // 合并宽度相同的项
            .flex-ruleFile {
                flex: 0.5 1 120px;
                min-width: 100px;
            }

            .flex-country {
                flex: 1 1 50px;
                min-width: 50px;
            }

            .flex-pkgName {
                flex: 1 1 250px;
                min-width: 250px;
            }
        }

    }

    // 中间表格
    .table-container {
        flex: 1 1 0;
        min-height: 0; // 关键，防止溢出
        overflow: auto;
        // 让el-table高度100%

    }

    // 底部

    .footer-btns {
        display: flex;
        justify-content: space-evenly;
        // gap: 16px;
        // height: 10%; // 减去顶部和底部的高度
    }
}
</style>