// 基础响应类型
export interface BaseResponse<T = any> {
    code: number;
    errMsg: string | null;
    data: T;
}

// 用户基础信息类型 (用于查询返回)
export interface UserInfo {
    id: string;
    password: string;
    role: string;
    cdate: string;
    accessCode?: string;
}

// 查询所有用户响应类型
export interface QueryAllUsersResponse extends BaseResponse<UserInfo[]> {}

// 创建用户参数类型
export interface CreateUserParams {
    id: string;
    password: string;
    role: string;
    accessCode?: string;
}

// 创建用户响应类型
export interface CreateUserResponse extends BaseResponse<null> {}

// 更新用户参数类型
export interface UpdateUserParams {
    id: string;
    password?: string;
    role?: string;
    accessCode?: string;
}

// 更新用户响应类型
export interface UpdateUserResponse extends BaseResponse<null> {}

// 删除用户参数类型
export interface DeleteUserParams {
    id: string;
}

// 删除用户响应类型
export interface DeleteUserResponse extends BaseResponse<null> {}

// 用户表单数据类型 (用于前端表单)
export interface UserFormData {
    id: string;
    password: string;
    role: string;
    accessCode?: string;
}