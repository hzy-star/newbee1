<template>
    <div class="user-management">
        <div class="header">
            <el-button v-if="isSuperAdmin" type="primary" @click="handleAdd">AddUser</el-button>
            <el-button type="primary" @click="handleQuery">Query</el-button>
        </div>
        <div class="content">
            <div class="table-setting-content">
                <el-table :data="userList" style="width: 100%" height="90%" border>
                    <el-table-column type="index" width="50" />
                    <el-table-column prop="id" label="用户名" />
                    <el-table-column prop="role" label="角色" />
                    <el-table-column prop="cdate" label="创建时间" />
                    <el-table-column label="操作" fixed="right" width="200">
                        <template #default="scope">
                            <el-button :disabled="!isSuperAdmin" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                            <el-button :disabled="!isAdmin" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>

        <el-dialog v-model="dialogFormVisible" title="add user" width="30%">
            <el-form :model="form" :rules="rules" ref="formRef">
                <el-form-item label="Account number" prop="id" :label-width="formLabelWidth">
                    <el-input :disabled="isEditMode" v-model="form.id" autocomplete="off" />
                </el-form-item>
                <el-form-item label="Password" prop="password" :label-width="formLabelWidth">
                    <el-input v-model="form.password" type="password" autocomplete="off" />
                </el-form-item>
                <el-form-item label="Role" prop="role" :label-width="formLabelWidth">
                    <el-select :disabled="!isSuperAdmin" v-model="form.role" placeholder="请选择角色">
                        <el-option label="管理员" value="admin" />
                        <el-option disabled label="超级管理员" value="superAdmin" />
                        <el-option label="普通用户" value="user" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">Cancel</el-button>
                    <el-button type="primary" @click="confirmAdduser">Confirm</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>


<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import useCookie from "@/store/modules/cookie";
const useCookies = useCookie()
const userRole = useCookies.userRole
console.log(userRole, 'userRole');

import {
    reqQueryall,
    reqAddUser,
    reqDelUser,
    reqEditUser
} from '@/api/setting/UserManagement';
import {
    ElMessage,
    ElMessageBox,
    type FormInstance,
    type FormRules
} from 'element-plus';
import type { UserInfo, UserFormData } from '@/api/setting/UserManagement/type';

const dialogFormVisible = ref(false);
const formLabelWidth = '140px';
const formRef = ref<FormInstance>();
const isEditMode = ref(false); // 添加这行

const form = reactive<UserFormData>({
    id: '',
    password: '',
    role: '',
    accessCode: ''
});

const userList = ref<UserInfo[]>([]);
const currentUserRole = ref(userRole); // 模拟当前用户角色

const isSuperAdmin = computed(() => currentUserRole.value === 'superAdmin');
const isAdmin = computed(() => currentUserRole.value === 'admin' || isSuperAdmin.value);

// 查询用户
const fetchUsers = async () => {
    try {
        const data = await reqQueryall();
        if (data.code === 200) {
            userList.value = data.data;
        } else {
            ElMessage.error(data.errMsg || '查询失败');
        }
    } catch (error) {
        ElMessage.error('请求失败');
        console.error(error);
    }
};

const handleQuery = fetchUsers;

// 点击新增
const handleAdd = () => {
    if (!isSuperAdmin.value) return;
    dialogFormVisible.value = true;
    isEditMode.value = false; // 新增模式
    form.id = '';
    form.password = '';
    form.role = '';
    form.accessCode = '';
};

// 确认新增/编辑
const confirmAdduser = async () => {
    if (!formRef.value) return;

    try {
        await formRef.value.validate();

        // 准备参数
        const params = {
            id: form.id,
            password: form.password,
            role: form.role,
            accessCode: form.accessCode || ''
        };
        debugger
        let res;
        if (isEditMode.value) {
            // 编辑
            res = await reqEditUser(params);
        } else {
            // 新增
            res = await reqAddUser(params);
        }
        if (res.code === 200) {
            ElMessage.success(isEditMode.value ? '编辑用户成功' : '新增用户成功');
            dialogFormVisible.value = false;
            fetchUsers();
        } else {
            ElMessage.error(res.errMsg || (isEditMode.value ? '编辑用户失败' : '新增用户失败'));
        }
    } catch (error) {
        console.error(isEditMode.value ? '编辑用户出错:' : '新增用户出错:', error);
    }
};

// 点击编辑
const handleEdit = (user: UserInfo) => {  // 修改这里
    if (!isAdmin.value) return;

    dialogFormVisible.value = true;
    isEditMode.value = true; // 编辑模式

    // 将当前行数据填充到表单
    form.id = user.id;
    form.password = user.password || ''; // 你接口可能不会返回密码，这里注意
    form.role = user.role;
    form.accessCode = user.accessCode || '';
};

// 删除用户
const handleDelete = async (user: UserInfo) => {
    try {
        await ElMessageBox.confirm(`确定删除用户 ${user.id} 吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        });
        debugger
        const  data = await reqDelUser({ id: user.id });  // 修改这里
        if (data.code === 200) {  // 修改这里
            ElMessage.success('删除成功');
            fetchUsers();
        } else {
            ElMessage.error(data.errMsg || '删除失败');  // 修改这里
        }
    } catch (error) {
        ElMessage.info('已取消删除');
    }
};

// 初始化加载用户数据
fetchUsers();

const rules = reactive<FormRules>({
    id: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在3到20个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少6位', trigger: 'blur' }
    ],
});
</script>

<style scoped lang="scss">
.user-management {
    width: 100%;
    display: flex;
    flex-direction: column;
    height: calc(100vh - $base-tabbar-height - 10px);

    .header {
        height: auto;
        display: flex;
        justify-content: right;
        margin-bottom: 16px;
    }

    .content {
        width: 100%;
        flex: 1;
        overflow: auto;

        .table-setting-content {
            height: 100%;
        }
    }
}
</style>