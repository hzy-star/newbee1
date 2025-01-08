<template>
    <el-dialog :model-value="modelValue" :title="title" align-center @close="handleClose" width="60%"
        :close-on-click-modal="false">
        <div class="task-form">
            <!-- 第一行 -->
            <el-row :gutter="20">
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">etype</div>
                        <el-select v-model="formData.etype" placeholder="select" clearable>
                            <el-option label="click" value="click" />
                            <el-option label="imp" value="imp" />
                        </el-select>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="form-item">
                        <div class="form-item-label">pkgName</div>
                        <el-input v-model="formData.pkgName" />
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">appId</div>
                        <el-input v-model="formData.appId" />
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">country</div>
                        <el-input v-model="formData.country" />
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">os</div>
                        <el-select v-model="formData.os" placeholder="select" clearable>
                            <el-option label="android" value="android" />
                            <el-option label="ios" value="ios" />
                        </el-select>
                    </div>
                </el-col>
            </el-row>

            <!-- 第三行 -->
            <el-row :gutter="24">
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">status</div>
                        <el-select v-model="formData.status" placeholder="select" clearable>
                            <el-option label="enabled" value="enabled" />
                            <el-option label="disabled" value="disabled" />
                        </el-select>
                    </div>
                </el-col>
            </el-row>
            <!-- 第四行 -->
            <el-row :gutter="24">
                <el-col :span="12">
                    <div class="form-item">
                        <div class="form-item-label">source</div>
                        <el-input v-model="formData.s" />
                    </div>
                </el-col>
                <el-col :span="12">
                    <div class="form-item">
                        <div class="form-item-label">ds_adx</div>
                        <el-input v-model="formData.ds_adx" placeholder="eg: google:xiaomi" />
                    </div>
                </el-col>
            </el-row>
            <!-- 第五行 -->
            <el-row :gutter="24">
                <el-col :span="12">
                    <div class="form-item">
                        <div class="form-item-label">ds_bundle</div>
                        <el-input v-model="formData.ds_bundle" placeholder="eg: com.test.bundle1:com.test.bundle2"/>
                    </div>
                </el-col>
                <el-col :span="12">
                    <div class="form-item">
                        <div class="form-item-label">urlparam</div>
                        <el-input v-model="formData.urlparam" placeholder="eg: sub_affiliate_id=base&aff_sub7=yyyy" />
                    </div>
                </el-col>
            </el-row>
            <!-- 第六行 -->
            <el-row :gutter="24">
                <el-col :span="12">
                    <div class="form-item">
                        <div class="form-item-label">offers</div>
                        <el-input v-model="formData.offers" placeholder="eg: offer1:offer2:offer3"/>
                    </div>
                </el-col>
                <el-col :span="12">
                    <div class="form-item">
                        <div class="form-item-label">target_pkg</div>
                        <el-input v-model="formData.target_pkg_name" placeholder="eg: com.shopee.br" />
                    </div>
                </el-col>
            </el-row>

            



            <div class="form-footer">
                <el-button type="primary" @click="handleSave('save')" >save</el-button>
                <el-button type="primary" @click="handleNew('new')" v-if="btnType != 'batchEdit'">new</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { reqAudienceList, reqTaskget } from "@/api/pushtask/index"
import type { FormDataType } from './type'
const audienceListRes = ref<any[]>([])
const props = defineProps({
    modelValue: Boolean,
    title: String,
    selectedIds: {
        type: Array as () => string[],
        default: () => []
    },
    currentRowData: {
        type: Object,
        default: null
    },
    autoBundleKey: {  // 添加这个prop
        type: Array,    // 或者根据实际类型调整
        default: () => []
    },
    btnType: {
        type: String,
    }
})


const emit = defineEmits(['update:modelValue', 'confirm', 'confirmNew'])

const formData = ref<FormDataType>({
    etype: '',
    pkgName:'',
    appId:'',
    country:'',
    os:'',
    status:'',
    s:'',
    ds_adx:'',
    ds_bundle:'',
    urlparam:'',
    offers:'',
    target_pkg_name:''
})

const handleClose = () => {
    emit('update:modelValue', false)
}
// 保存
const handleSave = (type:string) => {
    debugger
    emit('confirm', { ...formData.value, buttonType: type })
}
// 新增
const handleNew = (type:string) =>{
    console.log('formData.value:', formData.value);
    
    emit('confirm', { ...formData.value, buttonType: type })
}
interface AutoFilters {
    [key: string]: any;
}
const resTask = ref({
    clickTimeDelay: '',
    attr: {
        autoCrClickMin: '',
        eraseifa: false,
        noipuadup: false,
    },
    autoFilter: {} as AutoFilters
})
// 清空表单数据
const resetData = () => {
    formData.value = {
        etype: '',
        pkgName:'',
        appId:'',
        country:'',
        os:'',
        status:'',
        s:'',
        ds_adx:'',
        ds_bundle:'',
        urlparam:'',
        offers:'',
        target_pkg_name:''
    }
}
// 存储audience列表数据
const newData = ref<any>(null)
// 监听弹层显示状态
watch(() => props.modelValue, async (newVal) => {
    // 如果没有当前行数据，清空表单
    resetData()
    if (newVal) {  // 当弹层显示时
        try {
            newData.value = props.currentRowData
            if (newData.value) {
                // 如果有当前行数据，填充表单
                formData.value = {
                    etype: newData.value.etype,
                    pkgName:newData.value.pkgName,
                    appId:newData.value.appId,
                    country:newData.value.country,
                    os:newData.value.os,
                    status:newData.value.status,
                    s:newData.value.s,
                    ds_adx:newData.value.ds_adx,
                    ds_bundle:newData.value.ds_bundle,
                    urlparam:newData.value.urlparam,
                    offers:newData.value.offers,
                    target_pkg_name:newData.value.target_pkg_name
                }
            } else {
                // 如果没有当前行数据，清空表单
                resetData()
            }
        } catch (error) {
            // 如果没有当前行数据，清空表单
            resetData()
        }
    }
})
onMounted( async () => {
    console.log('autoBundleKey changed:', props.autoBundleKey)
            // formData.value.audienceList =  res.data || []
            // 弹层打开就调用一次  设备受众列表
            const res = await reqAudienceList()
            audienceListRes.value = res.data || []
})
</script>

<style scoped lang="scss">
.task-form {
    padding: 20px;

    .el-row {
        margin-bottom: 20px;
    }

    .form-item {
        display: flex;
        flex-direction: row;
        align-items: center;

        .form-item-label {
            display: inline-block;
            font-size: 14px;
            color: #606266;
            background-color: #f5f7fa;
            border: 1px solid #dcdfe6;
            border-right: none;
            padding: 8px;
            border-radius: 4px 0 0 4px;
            margin-bottom: 0;
            text-align: center;
            height: 32px;
            line-height: 16px;
            box-sizing: border-box;
            min-width: 20px;
            width: auto;
            white-space: nowrap;
        }

        // 修改select和input的左边圆角
        :deep(.el-input__wrapper),
        :deep(.el-select .el-input__wrapper) {
            border-radius: 0 4px 4px 0;
            height: 32px;
        }

        // 确保label右边没有圆角
        .form-item-label {
            border-radius: 4px 0 0 4px;
            border-right: none;
        }

        // 当没有label时，恢复左边圆角
        .el-select:first-child,
        .el-input:first-child {
            :deep(.el-input__wrapper) {
                border-radius: 4px;
            }
        }

        // 让输入框左边框与label贴合
        :deep(.el-input__wrapper),
        :deep(.el-select .el-input__wrapper) {
            border-radius: 0 4px 4px 0 !important;
            height: 32px;
        }

        // 让select和input占满剩余空间，但要考虑最小宽度
        .el-select,
        .el-input {
            flex: 1;
            min-width: 50px;
            width: 0;
        }

        // 调整checkbox的样式
        .el-checkbox {
            margin-left: 8px;
        }

        // 确保按钮样式正确
        .el-button {
            width: 100%;

            &.el-button--default {
                background-color: transparent;
                border: 1px solid #dcdfe6;
                color: #606266;
            }
        }
    }

    .form-footer {
        text-align: right;
        margin-top: 20px;
    }

    .targeting-section {
        margin-top: 20px;

        .title-with-line {
            display: flex;
            align-items: center;
            margin: 20px 0;

            h3 {
                margin: 0 10px;
                white-space: nowrap;
                order: 1;
                margin-left: 20px;
            }

            &::before {
                content: '';
                height: 1px;
                background-color: #dcdfe6;
                width: 20px;
                order: 0;
            }

            &::after {
                content: '';
                height: 1px;
                background-color: #dcdfe6;
                flex: 1;
                order: 2;
            }
        }
    }

    .form-item {
        .first-input {
            :deep(.el-input__wrapper) {
                border-radius: 4px 0 0 4px !important;
            }
        }

        .middle-input {
            :deep(.el-input__wrapper) {
                border-radius: 0;
            }
        }

        .last-input {
            :deep(.el-input__wrapper) {
                border-radius: 0 4px 4px 0;
            }
        }

        .no-radius {
            border-radius: 0;
        }
    }
}
</style>
