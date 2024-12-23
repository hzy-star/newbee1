<template>
    <el-dialog :model-value="modelValue" :title="title" align-center @close="handleClose" width="80%"
        :close-on-click-modal="false">
        <div class="task-form">
            <!-- 第一行 -->
            <el-row :gutter="20">
                <el-col :span="4">
                    <div class="form-item">
                        <el-select v-model="formData.type" placeholder="select" clearable>
                            <el-option label="click" value="click" />
                            <el-option label="imp" value="imp" />
                        </el-select>
                    </div>
                </el-col>
                <el-col :span="8">
                    <div class="form-item">
                        <div class="form-item-label">offers</div>
                        <el-input v-model="formData.offers" />
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">pkgName</div>
                        <el-input v-model="formData.pkgName" />
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">appid</div>
                        <el-input v-model="formData.appid" />
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">affId</div>
                        <el-input v-model="formData.affId" />
                    </div>
                </el-col>
            </el-row>

            <!-- 第二行 -->
            <el-row :gutter="24">
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
                            <el-option label="others" value="others" />
                        </el-select>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">usalg</div>
                        <el-select v-model="formData.usalg" placeholder="select" clearable>
                            <el-option label="true" value="true" />
                            <el-option label="dropWhenFail" value="dropWhenFail" />
                            <el-option label="false" value="false" />
                        </el-select>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">bsclick</div>
                        <el-select v-model="formData.bsclick" placeholder="select" clearable>
                            <el-option label="true" value="true" />
                            <el-option label="false" value="false" />
                        </el-select>
                    </div>
                </el-col>
                <el-col :span="8">
                    <div class="form-item">
                        <el-input v-model="formData.weight" class="first-input" />
                        <div class="form-item-label no-radius">%</div>
                        <el-input v-model="formData.gt" class="middle-input" />
                        <div class="form-item-label no-radius">＜X＜</div>
                        <el-input v-model="formData.lt" class="last-input" />
                    </div>
                </el-col>
            </el-row>

            <!-- 第三行 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <div class="form-item">
                        <div class="form-item-label">ifadupcheck</div>
                        <el-select v-model="formData.ifadupcheck" placeholder="select" clearable>
                            <el-option label="true" value="true" />
                            <el-option label="false" value="false" />
                        </el-select>
                        <el-select v-model="formData.checkservice" placeholder="select" clearable>
                            <el-option label="Primary" value="pri" />
                            <el-option label="Secondary" value="sec" />
                            <el-option label="ShortTime" value="less" />
                        </el-select>
                    </div>
                </el-col>
                <el-col :span="8">
                    <div class="form-item">
                        <div class="form-item-label">sendPlan</div>
                        <el-input v-model="formData.sendPlan" placeholder="1-3:90,12-15:101" />
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <el-button :type="formData.eraselfa ? 'primary' : 'default'"
                            @click="formData.eraselfa = !formData.eraselfa">
                            eraselfa
                        </el-button>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <el-button :type="formData.nolpUaDup ? 'primary' : 'default'"
                            @click="formData.nolpUaDup = !formData.nolpUaDup">
                            nolpUaDup
                        </el-button>
                    </div>
                </el-col>
            </el-row>

            <!-- 第四行 -->
            <el-row :gutter="20">
                <el-col :span="6">
                    <div class="form-item">
                        <div class="form-item-label">crFilter</div>
                        <el-select v-model="formData.crFilter" placeholder="select" clearable>
                            <!-- 添加选项 -->
                            <el-option label="topBundle3dayCr" value="top_bo_cr_3"></el-option>
                            <el-option label="topBundle7dayCr" value="top_bo_cr_7"></el-option>
                            <el-option label="topBundle7dayCrCpa" value="top_bo_cr_7_cpa"></el-option>
                            <el-option label="bundle3dayCr" value="bo_cr_3"></el-option>
                            <el-option label="bundle7dayCr" value="bo_cr_7"></el-option>
                            <el-option label="tag3dayCr" value="tag_cr_3"></el-option>
                            <el-option label="tag7dayCr" value="tag_cr_7"></el-option>
                            <el-option label="tag14dayCr" value="tag_cr_14"></el-option>
                            <el-option label="bundle3dayCrMax" value="v2_bo_cr_3_max"></el-option>
                            <el-option label="bundle7dayCrMax" value="v2_bo_cr_7_max"></el-option>
                            <el-option label="adx3dayCrMax" value="adx_cr_3_max"></el-option>
                            <el-option label="adx7dayCrMax" value="adx_cr_7_max"></el-option>
                            <el-option label="city7dayCr" value="top_city_cr"></el-option>
                            <el-option label="makeModel7dayCr" value="top_make_model_cr"></el-option>
                        </el-select>
                        <el-input v-model="formData.clickMin" />
                    </div>
                </el-col>
                <el-col :span="10">
                    <div class="form-item">
                        <div class="form-item-label">clickMin</div>
                        <el-input v-model="formData.clickMin" />
                        <el-checkbox v-model="formData.autoCr">AutoCr</el-checkbox>
                    </div>
                </el-col>
                <el-col :span="8">
                    <div class="form-item">
                        <div class="form-item-label">bundleSizeFilter</div>
                        <el-input v-model="formData.bundleSizeFilter" placeholder="eg. 2-10 or 3" />
                    </div>
                </el-col>
            </el-row>

            <!-- 第五行 -->
            <el-row :gutter="20">
                <el-col :span="4">
                    <div class="form-item">
                        <el-checkbox v-model="formData.sevenDaysClickFilter">7DaysClickFilter</el-checkbox>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <el-checkbox v-model="formData.invalidIfaFilter">invalidIfaFilter</el-checkbox>
                    </div>
                </el-col>
                <el-col :span="8">
                    <div class="form-item">
                        <div class="form-item-label">InvalidIfaOnly</div>
                        <el-select v-model="formData.invalidIfa" placeholder="select" clearable>
                            <!-- 添加选项 -->
                            <el-option label="true" value="true"></el-option>
                            <el-option label="false" value="false"></el-option>
                        </el-select>
                    </div>
                </el-col>
                <el-col :span="8">
                    <div class="form-item">
                        <div class="form-item-label">nearGateway</div>
                        <el-select v-model="formData.nearGateway" placeholder="select" clearable>
                            <!-- 添加选项 -->
                            <el-option label="true" value="true"></el-option>
                            <el-option label="false" value="false"></el-option>
                        </el-select>
                    </div>
                </el-col>
            </el-row>

            <!-- 第六行 -->
            <el-row :gutter="20">
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">clickRetry</div>
                        <el-select v-model="formData.clickRetry" placeholder="select" clearable>
                            <!-- 添加选项 -->
                            <el-option label="0" value="0"></el-option>
                            <el-option label="1" value="1"></el-option>
                            <el-option label="2" value="2"></el-option>
                        </el-select>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">cpaClick</div>
                        <el-select v-model="formData.randomClick" placeholder="select" clearable>
                            <!-- 添加选项 -->
                            <el-option label="true" value="true"></el-option>
                            <el-option label="false" value="false"></el-option>
                        </el-select>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">delayClick</div>
                        <el-select v-model="resTask.clickTimeDelay" placeholder="select" clearable>
                            <!-- 添加选项 -->
                            <el-option label="短" value="A"></el-option>
                        </el-select>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">abTestV</div>
                        <el-select v-model="formData.abTestVersion" placeholder="select" clearable>
                            <!-- 添加选项 -->
                            <el-option label="v1" value="v1"></el-option>
                            <el-option label="v2" value="v2"></el-option>
                            <el-option label="v3" value="v3"></el-option>
                            <el-option label="v4" value="v4"></el-option>
                            <el-option label="v5" value="v5"></el-option>
                            <el-option label="v1_bak" value="v1_bak"></el-option>
                            <el-option label="v2_bak" value="v2_bak"></el-option>
                            <el-option label="v3_bak" value="v3_bak"></el-option>
                            <el-option label="v4_bak" value="v4_bak"></el-option>
                            <el-option label="v5_bak" value="v5_bak"></el-option>
                        </el-select>
                    </div>
                </el-col>
                <el-col :span="8">
                    <div class="form-item">
                        <div class="form-item-label">topLtBundle</div>
                        <el-select v-model="formData.topLtBundle" :max-collapse-tags="4" multiple collapse-tags
                            collapse-tags-tooltip placeholder="Select" style="width: 240px" clearable>
                            <el-option label="A" value="A"></el-option>
                            <el-option label="B" value="B"></el-option>
                            <el-option label="C" value="C"></el-option>
                            <el-option label="D" value="D"></el-option>
                            <el-option label="E" value="E"></el-option>
                            <el-option label="F" value="F"></el-option>
                            <el-option label="G" value="G"></el-option>
                            <el-option label="H" value="H"></el-option>

                        </el-select>
                    </div>
                </el-col>
            </el-row>

            <!-- 第七行 -->
            <el-row :gutter="20">
                <el-col :span="16">
                    <div class="form-item">
                        <div class="form-item-label">autoTopBundle</div>
                        <el-select v-model="formData.autoTopBundle" :max-collapse-tags="4" multiple collapse-tags
                            collapse-tags-tooltip placeholder="Select" style="width: 240px" clearable>
                            <!-- 添加 "全部" 选项 -->
                            <el-option label="All" value="all" />
                            <!-- 动态添加其他选项 -->
                            <el-option v-for="item in props.autoBundleKey" :key="item" :label="item" :value="item" />
                        </el-select>
                    </div>
                </el-col>
                <el-col :span="8">
                    <div class="form-item">
                        <div class="form-item-label">autoTopVer</div>
                        <el-select v-model="formData.autoTestVersion" placeholder="select" clearable>
                            <!-- 添加选项 -->
                            <el-option label="v1" value="v1"></el-option>
                            <el-option label="v2" value="v2"></el-option>
                            <el-option label="v3" value="v3"></el-option>
                            <el-option label="v4" value="v4"></el-option>
                            <el-option label="v5" value="v5"></el-option>
                            <el-option label="v1_bak" value="v1_bak"></el-option>
                            <el-option label="v2_bak" value="v2_bak"></el-option>
                            <el-option label="v3_bak" value="v3_bak"></el-option>
                            <el-option label="v4_bak" value="v4_bak"></el-option>
                            <el-option label="v5_bak" value="v5_bak"></el-option>
                        </el-select>
                    </div>
                </el-col>
            </el-row>

            <!-- 第八行 -->
            <el-row :gutter="24">
                <el-col :span="24">
                    <div class="form-item">
                        <div class="form-item-label">base64Info</div>
                        <el-input v-model="formData.base64Info" placeholder="aff_sub2,ds_adx,ds_bundle,ip,ua" />
                    </div>
                </el-col>
            </el-row>

            <!-- 第九行 -->
            <el-row :gutter="24">
                <el-col :span="24">
                    <div class="form-item">
                        <div class="form-item-label">deviceFilter</div>
                        <el-input v-model="formData.filter" placeholder="e.g. adx=adxName&make=品牌&bundle=媒体app" />
                    </div>
                </el-col>
            </el-row>

            <!-- 第十行 -->
            <el-row :gutter="24">
                <el-col :span="24">
                    <div class="form-item">
                        <div class="form-item-label">urlparams</div>
                        <el-input v-model="formData.urlparams" placeholder="" />
                    </div>
                </el-col>
            </el-row>

            <!-- Targeting -->
            <div class="targeting-section">
                <div class="title-with-line">
                    <h3>Targeting</h3>
                </div>
                <div class="form-item">
                    <div class="form-item-label">设备受众</div>
                    <el-select v-model="audienceList" :max-collapse-tags="4" multiple collapse-tags
                        collapse-tags-tooltip placeholder="Select" style="width: 240px" filterable clearable>
                        <!-- 动态添加其他选项 -->
                        <el-option v-for="item in audienceList" :key="item.id" :label="item.name" :value="item.name" />
                    </el-select>
                </div>
            </div>


            <div class="form-footer">
                <el-button type="primary" @click="handleSave">save</el-button>
                <el-button type="primary" @click="handleNew">new</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits, watch, onMounted } from 'vue'
import { reqAudienceList, reqTaskget } from "@/api/pushtask/index"

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
    }
})
onMounted(() => {
    console.log('autoBundleKey changed:', props.autoBundleKey)
})


const emit = defineEmits(['update:modelValue', 'confirm', 'confirmNew'])

const formData = ref({
    type: '',
    offers: '',
    pkgName: '',
    appid: '',
    affId: '',
    country: '',
    os: '',
    usalg: '',
    bsclick: '',
    weight: '',
    gt: '',
    lt: '',
    ifadupcheck: '',
    checkservice: '',
    primary: '',
    sendPlan: '',
    crFilter: '',
    clickMin: '',
    autoCr: false,
    bundleSizeFilter: '',
    sevenDaysClickFilter: false,
    invalidIfaFilter: false,
    invalidIfa: '',
    nearGateway: '',
    clickRetry: '',
    randomClick: '',
    abTestVersion: '',
    topLtBundle: '',
    autoTopBundle: [],
    autoTestVersion: '',
    base64Info: '',
    filter: '',
    urlparams: '',
    eraselfa: false,
    nolpUaDup: false,
})

const handleClose = () => {
    emit('update:modelValue', false)
}

const handleSave = () => {
    emit('confirm', formData.value)
}
const resTask = ref({
    clickTimeDelay: ''
})
const handleNew = () => {
    formData.value = {
        type: '',
        offers: '',
        pkgName: '',
        appid: '',
        affId: '',
        country: '',
        os: '',
        usalg: '',
        bsclick: '',
        weight: '',
        gt: '',
        lt: '',
        ifadupcheck: '',
        checkservice: '',
        primary: '',
        sendPlan: '',
        crFilter: '',
        clickMin: '',
        autoCr: false,
        bundleSizeFilter: '',
        sevenDaysClickFilter: false,
        invalidIfaFilter: false,
        invalidIfa: '',
        nearGateway: '',
        clickRetry: '',
        randomClick: '',
        abTestVersion: '',
        topLtBundle: '',
        autoTopBundle: [],
        autoTestVersion: '',
        base64Info: '',
        filter: '',
        urlparams: '',
        eraselfa: false,
        nolpUaDup: false,
    }
    resTask.value.clickTimeDelay = ''
    audienceList.value = []
}
// 定义接口类型
interface AudienceItem {
    id: number
    name: string
    audienceType: string
    content: string
    checkIn: boolean
    empty: boolean
    bloomFilter: boolean
}
// 存储audience列表数据
const audienceList = ref<AudienceItem[]>([])
const newData = ref<any>(null)
// 监听弹层显示状态
watch(() => props.modelValue, async (newVal) => {
    // 如果没有当前行数据，清空表单
    handleNew()
    if (newVal) {  // 当弹层显示时
        try {
            newData.value = props.currentRowData
            if (newData.value) {
                // 如果有当前行数据，填充表单
                formData.value = {
                    type: newData.value.etype || '',
                    offers: newData.value.offers || '',
                    pkgName: newData.value.pkgName || '',
                    appid: newData.value.appId || '',
                    affId: newData.value.affId || '',
                    country: newData.value.country || '',
                    os: newData.value.os || '',
                    usalg: newData.value.usealg || '',
                    bsclick: newData.value.bsclick || '',
                    weight: newData.value.weight || '',
                    gt: newData.value.gt || '',
                    lt: newData.value.lt || '',
                    ifadupcheck: newData.value.ifadupcheck.split(":")[0] || '',
                    checkservice: newData.value.ifadupcheck.split(":")[1] || '',
                    primary: newData.value.primary || '',
                    sendPlan: newData.value.sendPlan || '',
                    crFilter: newData.value.crFilter || '',
                    clickMin: newData.value.clickMin || '',
                    autoCr: newData.value.autoCr || false,
                    bundleSizeFilter: newData.value.bundleSizeFilter || '',
                    sevenDaysClickFilter: newData.value.sevenDaysClickFilter || false,
                    invalidIfaFilter: newData.value.invalidIfaFilter || false,
                    invalidIfa: newData.value.invalidIfa || '',
                    nearGateway: newData.value.nearGateway || '',
                    clickRetry: newData.value.clickRetry || '',
                    randomClick: newData.value.randomClick || '',
                    abTestVersion: newData.value.abTestVersion || '',
                    topLtBundle: newData.value.topLtBundle.split(',') || '',
                    autoTopBundle: newData.value.autoTopBundle.split(',') || [],
                    autoTestVersion: newData.value.autoTestVersion || '',
                    base64Info: newData.value.base64Info || '',
                    filter: newData.value.filter || '',
                    urlparams: newData.value.urlparams || '',
                    eraselfa: newData.value.eraselfa || false,
                    nolpUaDup: newData.value.nolpUaDup || false,
                }
                console.log(props);

                const resTaskData = await reqTaskget({ taskId: props.currentRowData.id })
                resTask.value = resTaskData
                console.log(resTask.value.clickTimeDelay);
            } else {
                // 如果没有当前行数据，清空表单
                handleNew()
            }
            // 弹层打开就调用一次  设备受众列表
            const res = await reqAudienceList()
            audienceList.value = res.data
            console.log(audienceList.value);
        } catch (error) {
            // 如果没有当前行数据，清空表单
            handleNew()
        }
    }
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
