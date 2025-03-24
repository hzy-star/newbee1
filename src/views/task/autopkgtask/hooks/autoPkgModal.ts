import { ref } from 'vue'
import { useTaskStore } from '@/store/pushtask/autoPkgTask'
import type { FormDataType } from '@/components/task/AutoPkgTask/type'
import { reqNewSaveTask,reqBatchEdits } from "@/api/pushtask/autoPkgTask"
import { ElMessage } from 'element-plus';
import { Response } from './type'

export default function autoPkgModal(tableRef: any, findAllHooks: (type: boolean) => Promise<void>) {
    const taskStore = useTaskStore()
    const showModal = ref(false)
    const modalTitle = ref('')
    const btnType = ref('')
    const currentRowData = ref<any>(null)

    const handleModals = async (formData: FormDataType): Promise<void> => {
        const { buttonType, ...resformData } = formData;
        const taskInfo = buildTaskInfo(resformData);
        const params = new URLSearchParams();
        let res = ref<Response>();

        const actions: Record<string, Record<string, () => void>> = {
            // 批量编辑--只有save方法
            batchEdit: {
                save: () => {
                    delete taskInfo.status
                    taskInfo.task_ids = taskStore.selectedIds.join(',');
                },
            },
            // 新增任务--save和new方法
            addJob: {
                save: () => {
                    
                },
                new: () => {
                    taskInfo.id = '';
                },
            },
            // 编辑任务--save和new方法
            showTask: {
                // 保存任务 参数中应该包含id
                save: () => {
                    taskInfo.id = taskStore.selectedIds.join(',');
                },
                new: () => {
                    taskInfo.id = '';
                },
            },
        };

        if (actions[btnType.value] && actions[btnType.value][buttonType as string]) {
            actions[btnType.value][buttonType as string]();
            Object.entries(taskInfo).forEach(([key, value]) => params.append(key, String(value)));
            res.value = await (btnType.value === 'batchEdit' ? reqBatchEdits(params) : reqNewSaveTask(params));
        }
        res.value && handleResponse(res.value);
    };

    const buildTaskInfo = (resformData: any): Record<string, any> => {
        const taskInfo: Record<string, any> = {};
        Object.entries(resformData).forEach(([key, value]) => {
            // 过滤掉null和undefined值，空字符串保留
            if (value !== null && value !== undefined) {
                taskInfo[key] = value;
            }
        });
        return taskInfo;
    };

    // 处理响应
    const handleResponse = (response: Response): void => {
        if (response.message === 'success') {
            ElMessage.success(response.message);
            findAllHooks(false);
            showModal.value = false;
        } else {
            ElMessage.error(response.message);
        }
    };

    // 批量编辑
    const formatEdits = (ids: string[]) => {
        if (ids.length <= 1) {
            return ids.join(', ');
        }
        return `${ids.slice(0, 1).join(', ')}... (共${ids.length}个)`;
    }

    // 批量编辑
    const formatSelectedIds = (ids: string[]) => {
        return formatEdits(ids)
    }
    const BatchEdits = () => {
        // ... 批量编辑逻辑
        const $table = tableRef.value
        if ($table) {
            const selectRecords = $table.getCheckboxRecords()
            if (selectRecords.length < 2) {
                ElMessage.warning('请选择至少2条要编辑的任务')
                return
            }
            taskStore.selectedIds = selectRecords.map((row: any) => row.id)
            modalTitle.value = `TaskDetail [${formatSelectedIds(taskStore.selectedIds)}]`
            currentRowData.value = null // 清空当前行数据
            showModal.value = true
            btnType.value = 'batchEdit'
        }
    }

    return {
        showModal,
        modalTitle,
        btnType,
        currentRowData,
        handleModals,
        BatchEdits,
        formatEdits
    }
}