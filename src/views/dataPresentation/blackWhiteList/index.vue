<template>
    <div class="blacklist-white-list-page">
        <!-- 顶部搜索条件区 -->
        <div class="search-form-container">
            <el-form :inline="true" :model="searchForm" :rules="searchRules" ref="searchFormRef" class="search-form">
                <el-form-item label="etype" prop="etype" class="flex-item flex-etype">
                    <el-select v-model="searchForm.etype" placeholder="请选择" class="flex-select">
                        <el-option label="click" value="click" />
                        <el-option label="imp" value="imp" />
                    </el-select>
                </el-form-item>
                <el-form-item label="listtype" prop="listType" class="flex-item flex-listtype">
                    <el-select v-model="searchForm.listtype" placeholder="请选择" class="flex-select">
                        <el-option label="黑名单" value="blacklist" />
                        <el-option label="白名单" value="whitelist" />
                    </el-select>
                </el-form-item>
                <el-form-item label="country" prop="country" class="flex-item flex-country">
                    <el-input v-model="searchForm.country" placeholder="请输入国家" clearable class="flex-select" />
                </el-form-item>
                <el-form-item label="pkgname" prop="pkgname" class="flex-item flex-pkgname">
                    <el-input v-model="searchForm.pkgname" placeholder="请输入包名" clearable class="flex-select" />
                </el-form-item>
                <el-form-item label="field" class="flex-item flex-field">
                    <el-select v-model="searchForm.field" placeholder="请选择" class="flex-select" clearable>
                        <el-option label="adx" value="adx" />
                        <el-option label="bundle" value="bundle" />
                    </el-select>
                </el-form-item>
                <el-form-item label="os" class="flex-item flex-os">
                    <!-- <el-input v-model="searchForm.os" placeholder="请输入os" clearable class="flex-select" /> -->
                    <el-select v-model="searchForm.os" placeholder="请选择os" class="flex-select" clearable>
                        <el-option label="ios" value="ios" />
                        <el-option label="android" value="android" />
                    </el-select>
                </el-form-item>
                <el-form-item label="tag" class="flex-item flex-tag">
                    <!-- <el-input v-model="searchForm.tag" placeholder="请输入tag" clearable class="flex-select" /> -->

                    <el-select v-model="searchForm.tag" placeholder="请选择tag" class="flex-select" clearable>
                        <el-option label="CR" value="CR" />
                        <el-option label="RR" value="RR" />
                        <el-option label="OUT" value="OUT" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSearch">查询</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 中间表格区 -->
        <div class="table-container">
            <el-table :data="tableData" height="100%" border>
                <el-table-column type="index" :index="indexMethod" min-width="5%" align="center" />
                <!-- <el-table-column prop="etype" label="etype" min-width="10%" />
                <el-table-column prop="listtype" label="listtype" min-width="10%" /> -->
                <el-table-column prop="country" label="country" min-width="5%" align="center" />
                <el-table-column prop="pkgname" label="pkgname" min-width="20%" align="center" />
                <el-table-column prop="field" label="field" min-width="10%" align="center" />
                <el-table-column prop="value" label="value" min-width="30%" show-overflow-tooltip />
                <el-table-column prop="os" label="os" min-width="10%" align="center" />
                <el-table-column prop="tag" label="tag" min-width="10%" align="center" />
                <el-table-column prop="rate" label="rate" min-width="5%" align="center" />
                <el-table-column label="操作" width="130" align="center">
                    <template #default="scope">
                        <el-button type="success" text size="small"
                            @click="openEditDialog(scope.row,'edit')">修改</el-button>
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
            :title="dialogType === 'replace' ? '替换名单' : dialogType === 'edit' ? '修改名单' : '新增名单'" width="60vw"
            :top="'20vh'" @close="handleDialogClose">
            <el-form :model="dialogForm" :rules="dialogRules" ref="dialogFormRef" label-width="100px">
                <el-row :gutter="10">
                    <el-col :span="8">
                        <el-form-item label="etype" prop="etype">
                            <el-select v-model="dialogForm.etype" placeholder="请选择"
                                :disabled="isDialogFieldDisabled('etype')">
                                <el-option label="click" value="click" />
                                <el-option label="imp" value="imp" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="listType" prop="listType">
                            <el-select v-model="dialogForm.listtype" placeholder="请选择"
                                :disabled="isDialogFieldDisabled('listtype')">
                                <el-option label="黑名单" value="blacklist" />
                                <el-option label="白名单" value="whitelist" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="country" prop="country">
                            <el-input v-model="dialogForm.country" placeholder="请输入国家" clearable
                                :disabled="isDialogFieldDisabled('country')" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="8">
                        <el-form-item label="pkgname" prop="pkgname">
                            <el-input v-model="dialogForm.pkgname" placeholder="请输入包名" clearable
                                :disabled="isDialogFieldDisabled('pkgname')" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="field">
                            <el-select v-model="dialogForm.field" placeholder="请选择"
                                :disabled="isDialogFieldDisabled('field')">
                                <el-option label="adx" value="adx" />
                                <el-option label="bundle" value="bundle" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="os">
                            <!-- <el-input v-model="dialogForm.os" placeholder="请输入os" clearable /> -->

                            <el-select v-model="dialogForm.os" placeholder="请选择" clearable
                                :disabled="isDialogFieldDisabled('os')">
                                <el-option label="ios" value="ios" />
                                <el-option label="android" value="android" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="8">
                        <el-form-item label="tag">
                            <!-- <el-input v-model="dialogForm.tag" placeholder="请输入tag" clearable :disabled="isDialogFieldDisabled('tag')" /> -->
                            <el-select v-model="dialogForm.tag" placeholder="请选择tag" class="flex-select" clearable
                                :disabled="isDialogFieldDisabled('tag')">
                                <el-option label="CR" value="CR" />
                                <el-option label="RR" value="RR" />
                                <el-option label="OUT" value="OUT" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="rate">
                            <el-input v-model="dialogForm.rate" placeholder="请输入比例" clearable />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="Content">
                            <el-input v-model="dialogForm.dataList" type="textarea" :rows="4" placeholder="请输入内容" />
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
import { ElMessage,ElMessageBox} from 'element-plus'
import { reqBlackwhiteUrl, reqReplaceUrl, reqAddUrl, reqDeleteUrl } from '@/api/dataPresentation/blackWhiteList'
import _ from 'lodash'
const searchFormRef = ref()
const dialogFormRef = ref()

// 搜索表单
const searchForm = reactive({
    etype: 'click',
    listtype: 'blacklist',
    country: '',
    pkgname: '',
    field: 'adx',
    os: '',
    tag: ''
})
const indexMethod = (index: number) => {
  return index + 1
}
// 监听 searchForm.pkgname 自动切换 os
// watch(() => searchForm.pkgname, (val) => {
//     if (val && /^\d+$/.test(val)) {
//         searchForm.os = 'ios'
//     } else {
//         searchForm.os = 'android'
//     }
// })

const searchRules = {
    etype: [{ required: true, message: '请选择类型', trigger: 'change' }],
    listtype: [{ required: true, message: '请选择名单类型', trigger: 'change' }],
    country: [{ required: true, message: '请输入国家', trigger: 'blur' }],
    pkgname: [{ required: true, message: '请输入包名', trigger: 'blur' }],
}

// 表格数据
const tableData = ref<any[]>([])
const saveSearchForm = ref<any>(null)
// 查询方法
const onSearch = async () => {
    searchFormRef.value.validate((valid: boolean) => {
        if (!valid) return
        saveSearchForm.value = null // 清除保存的搜索条件
        reqBlackwhiteUrl(searchForm).then((res: any) => {
            if (res.code === 200) {
                tableData.value = res.data || []
                saveSearchForm.value = _.cloneDeep(searchForm) // 保存当前搜索条件
            } else {
                ElMessage.error(res.message || '查询失败')
            }
        }).catch((error: any) => {
            ElMessage.error(error.message || '查询失败')
        }).finally(() => {
            // 可以在这里添加任何需要的清理操作
        })
    })
}

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref<'replace' | 'add' | 'edit'>('add')
const dialogForm = reactive({
    etype: 'click',
    listtype: 'blacklist',
    country: '',
    pkgname: '',
    field: 'adx',
    os: '',
    tag: '',
    rate: null,
    dataList: ''
}) as Record<string, any>

// 监听 dialogForm.pkgname 自动切换 os
// watch(() => dialogForm.pkgname, (val) => {
//     if (val && /^\d+$/.test(val)) {
//         dialogForm.os = 'ios'
//     } else {
//         dialogForm.os = 'android'
//     }
// })

const dialogRules = {
    etype: [{ required: true, message: '请选择类型', trigger: 'change' }],
    listtype: [{ required: true, message: '请选择名单类型', trigger: 'change' }],
    country: [{ required: true, message: '请输入国家', trigger: 'blur' }],
    pkgname: [{ required: true, message: '请输入包名', trigger: 'blur' }],
    rate: [
        { required: true, message: '请输入比例', trigger: 'blur' },
        { validator: (rule: any, value: any, callback: any) => {
            if (value === '' || value === null || value === undefined) {
                callback(new Error('请输入比例'))
            } else if (isNaN(value) || Number(value) < 0 || Number(value) > 1) {
                callback(new Error('比例必须是0-1之间的数字'))
            } else {
                callback()
            }
        }, trigger: 'blur' }
    ]
}
const oldData = ref<any>()
// 打开弹窗
const openEditDialog = (row: any, type: 'replace' | 'add' | 'edit') => {
    dialogType.value = type
    dialogVisible.value = true
    oldData.value = ''
    if (type === 'replace' && row) {
        // 替换时依然从搜索条件带入
        dialogForm.etype = saveSearchForm.value.etype
        dialogForm.listtype = saveSearchForm.value.listtype
        dialogForm.country = saveSearchForm.value.country
        dialogForm.pkgname = saveSearchForm.value.pkgname
        dialogForm.field = saveSearchForm.value.field || 'adx'
        dialogForm.os = saveSearchForm.value.os
        dialogForm.tag = saveSearchForm.value.tag
        dialogForm.rate = row.rate || 1
        dialogForm.dataList = ''
    } else if ((type === 'edit') && row) {
        // 修改时所有内容从row取值
        dialogForm.etype = row.etype || ''
        dialogForm.listtype = row.listtype || ''
        dialogForm.country = row.country || ''
        dialogForm.pkgname = row.pkgname || ''
        dialogForm.field = row.field || ''
        dialogForm.os = row.os || ''
        dialogForm.tag = row.tag || ''
        dialogForm.rate = row.rate || 1
        dialogForm.dataList = row.value || ''
        oldData.value = row
    } else {
        // 新增时清空，默认选中click和黑名单
        dialogForm.etype = 'click'
        dialogForm.listtype = 'blacklist'
        dialogForm.country = ''
        dialogForm.pkgname = ''
        dialogForm.field = 'adx'
        dialogForm.os = ''
        dialogForm.tag = ''
        dialogForm.rate = null
        dialogForm.dataList = ''
    }
}
// 关闭弹窗
const handleDialogClose = () => {
    dialogVisible.value = false
    resetDialogForm()
}
// 重置弹窗表单
const resetDialogForm = () => {
  dialogForm.etype = 'click'
  dialogForm.listtype = 'blacklist'
  dialogForm.country = ''
  dialogForm.pkgname = ''
  dialogForm.field = 'adx'
  dialogForm.os = ''
  dialogForm.tag = ''
  dialogForm.rate = null
  dialogForm.dataList = ''
}
// 替换操作
const onDialogReplace = (row:string) => {
    dialogFormRef.value.validate((valid: boolean) => {
        if (!valid) return
        // 兜底校验 rate
        const rateNum = Number(dialogForm.rate)
        if (isNaN(rateNum) || rateNum < 0 || rateNum > 1) {
            ElMessage.error('比例必须是0-1之间的数字')
            return
        }
        debugger
        const listDto = {
            etype: dialogForm.etype,
            listtype: dialogForm.listtype,
            country: dialogForm.country,
            pkgname: dialogForm.pkgname,
            field: dialogForm.field,
            rate: dialogForm.rate,
            tag: dialogForm.tag,
            os: dialogForm.os,
            // ...(row === 'edit' ? { value: dialogForm.dataList } : {})
        }
        // 多行内容转数组，过滤空行
        const dataListReplace = (dialogForm.dataList || '').split(/\r?\n/).map((i: any) => i.trim()).filter((i: any) => i)
        const params = {
            listDto,
            dataList: dataListReplace,
            queryParam: row === 'edit'
                ?  {
                // 必填字段（确保一定有值）
                etype: oldData.value.etype ?? '',
                listtype: oldData.value.listtype ?? '',
                country: oldData.value.country ?? '',
                pkgname: oldData.value.pkgname ?? '',
                // 可选字段
                ..._.pick(oldData.value, ['field', 'os','rate', 'tag', 'value'])
            }
                : { ...saveSearchForm.value },
        };
        reqReplaceUrl(params).then((res: any) => {
            if (res.code === 200) {
                ElMessage.success('替换成功！')
                dialogVisible.value = false
                onSearch() // 刷新表格
            } else {
                ElMessage.error(res.message || '替换失败')
            }
        }).catch((error: any) => {
            ElMessage.error(error.message || '替换失败')
        }).finally(() => {
            // 
        })
    })
}
// 新增操作
const onDialogAdd = () => {
    dialogFormRef.value.validate((valid: boolean) => {
        if (!valid) return
        // 兜底校验 rate
        const rateNum = Number(dialogForm.rate)
        if (isNaN(rateNum) || rateNum < 0 || rateNum > 1) {
            ElMessage.error('比例必须是0-1之间的数字')
            return
        }
        const listDto = {
            etype: dialogForm.etype,
            listtype: dialogForm.listtype,
            country: dialogForm.country,
            pkgname: dialogForm.pkgname,
            field: dialogForm.field,
            rate: dialogForm.rate,
            tag: dialogForm.tag,
            os: dialogForm.os
        }
        // 多行内容转数组，过滤空行
        const dataListAdd = (dialogForm.dataList || '').split(/\r?\n/).map((i: any) => i.trim()).filter((i: any) => i)
        const params = {
            listDto,
            dataList: dataListAdd
        }
        reqAddUrl(params).then((res: any) => {
            if (res.code === 200) {
                ElMessage.success('新增成功！')
                dialogVisible.value = false
                onSearch() // 刷新表格
            } else {
                ElMessage.error(res.message || '新增失败')
            }
        }).catch((error: any) => {
            ElMessage.error(error.message || '新增失败')
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
    const confirmMessage = row ? '确定要删除该记录吗？' : '确定要删除该名单吗？'
    await ElMessageBox.confirm(confirmMessage, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 准备参数
    const params = row ? { ...row } : { ...saveSearchForm.value }
    
    // 执行删除
    const res = await reqDeleteUrl(params)
    
    if (res.code === 200) {
      ElMessage.success('删除成功！')
      onSearch() // 刷新表格
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error: any) {
    // 统一处理取消和错误情况
    if (error === 'cancel' || error === 'close') {
      ElMessage.info('已取消删除操作')
    } else {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 生成弹窗字段的禁用状态
const isDialogFieldDisabled = (field: string) => {
    if (dialogType.value === 'replace') {
        // 替换时：有搜索条件的字段禁用，无值可编辑
        return !!(saveSearchForm.value as Record<string, any>)[field]
    }
    if (dialogType.value === 'edit') {
        // 修改时：除了 tag、rate、dataList 以外的字段全部禁用
        const editableFields = ['tag', 'rate', 'dataList']
        return !editableFields.includes(field)
    }
    return false
}
</script>

<style scoped lang="scss">
.blacklist-white-list-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - $base-tabbar-height - 10px);
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
            .flex-etype,
            .flex-listtype {
                flex: 0.5 1 120px;
                min-width: 100px;
            }
            .flex-country {
                flex: 1 1 50px;
                min-width: 50px;
            }
            .flex-pkgname {
                flex: 1 1 250px;
                min-width: 250px;
            }
            .flex-field {
                flex: 1 1 100px;
                min-width: 100px;
            }
            .flex-os,
            .flex-tag {
                flex: 0.5 1 80px;
                min-width: 80px;
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