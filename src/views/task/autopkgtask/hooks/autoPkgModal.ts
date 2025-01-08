import { ref } from 'vue'
import { useTaskStore } from '@/store/pushtask/task'
import type { FormDataType } from '@/components/task/type'
import { reqSaveTask, reqBatchSaveTasks } from "@/api/pushtask/index"
import { ElMessage } from 'element-plus';

export default function autoPkgModal(tableRef: any, findAllHooks: (type: boolean) => Promise<void>) {
    const taskStore = useTaskStore()
    const showModal = ref(false)
    const modalTitle = ref('')
    const btnType = ref('')
    const currentRowData = ref<any>(null)

    const handleModals = async (formData: FormDataType): Promise<void> => {
        debugger
        const { buttonType, ...resformData } = formData;
        const taskInfo = buildTaskInfo(resformData);
        const params = new URLSearchParams();
        let res = ref<string>('');

        const actions: Record<string, Record<string, () => void>> = {
            batchEdit: {
                save: () => {
                    taskInfo.ids = taskStore.selectedIds.join(',');
                    taskInfo.isBatchEdit = 'yes';
                },
                new: () => {
                    taskInfo.batchType = 'new';
                    taskInfo.id = '';
                },
            },
            addTask: {
                new: () => {
                    taskInfo.batchType = 'new';
                    taskInfo.id = '';
                },
            },
            showTask: {
                save: () => isTemplate(resformData.taskStatus, taskInfo),
                new: () => {
                    taskInfo.batchType = 'new';
                    taskInfo.id = '';
                    isTemplate(resformData.taskStatus, taskInfo);
                },
            },
        };

        if (actions[btnType.value] && actions[btnType.value][buttonType as string]) {
            actions[btnType.value][buttonType as string]();
            delete taskInfo.audienceList;
            delete taskInfo.invalidIfaFilter;
            Object.entries(taskInfo).forEach(([key, value]) => params.append(key, String(value)));
            res.value = await (btnType.value === 'batchEdit' ? reqBatchSaveTasks(params) : reqSaveTask(params));
        }

        handleResponse(res.value);
    };

    const buildTaskInfo = (resformData: any): Record<string, any> => {
        return {
            ...resformData,
            autoCrFilterName: (resformData.autoCrFilterName || []).join(','),
            autoTopBundle: (resformData.autoTopBundle || []).join(','),
            topLtBundle: (resformData.topLtBundle || []).join(','),
            attr: JSON.stringify({
                autoCrClickMin: resformData.autoCrClickMin || '',
                eraseifa: (resformData.eraseifa || false).toString(),
                noipuadup: (resformData.noipuadup || false).toString(),
            }),
            audiences: JSON.stringify({
                ifaAudience: ['', resformData.ifaAudience || '1'],
                optionFilterText: '',
            }),
            autoTrafficFilter: [
                resformData.autoCr && 'auto_cr',
                resformData.sevenDaysClickFilter && 'day7click',
                resformData.invalidIfaFilter && 'invalid_ifa_filter',
            ].filter(Boolean).join(','),
            autoFilterRuleNames: [
                [
                    resformData.autoCr && 'auto_cr',
                    resformData.sevenDaysClickFilter && 'day7click',
                    resformData.invalidIfaFilter && 'invalid_ifa_filter',
                ].filter(Boolean),
                resformData.autoCrFilterName || [],
            ].flat().join(','),
            autoFilterRuleValues: JSON.stringify(
                (resformData.autoCrFilterName || []).reduce((acc: Record<string, string>, name: string, index: number) => {
                    const values = (resformData.autoCrFilterVal || '').split(',')[index];
                    acc[name] = values || '';
                    return acc;
                }, {})
            ),
            ifadupcheck: `${resformData.ifadupcheck || ''}:${resformData.checkservice || ''}`,
            id: taskStore.selectedIds.join(',') || '',
            ifaAudience: resformData.ifaAudience || ',1',
        };
    };

    const isTemplate = (taskStatus: string, taskInfo: Record<string, any>): void => {
        if (taskStatus === 'template') {
            taskInfo.isTemplate = 'yes';
            taskInfo.offers = taskInfo.offers || 'all';
            taskInfo.country = taskInfo.country || 'all';
        }
    };

    const addTemplate = (taskInfo: Record<string, any>): void => {
        taskInfo.isTemplate = 'yes';
        taskInfo.offers = taskInfo.offers || 'all';
        taskInfo.country = taskInfo.country || 'all';
    };

    const handleResponse = (response: string): void => {
        if (response === 'success') {
            ElMessage.success('保存成功');
            findAllHooks(false);
            showModal.value = false;
        } else {
            ElMessage.error('保存失败');
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