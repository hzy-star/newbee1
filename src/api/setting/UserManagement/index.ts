import request from "@/utils/request";
import {
  QueryAllUsersResponse,
  CreateUserParams,
  CreateUserResponse,
  UpdateUserParams,
  UpdateUserResponse,
  DeleteUserParams,
  DeleteUserResponse
} from './type';

enum API {
  GETUSER_URL = '/newbee/user/all',
  ADDUSER_URL = '/newbee/user/add',
  DELETEUSER_URL = '/newbee/user/delete',
  EDITUSER_URL = '/newbee/user/update',
}

// 查询所有用户
export const reqQueryall = async () => {
    debugger
  const  data  = await request.get<any,QueryAllUsersResponse>(API.GETUSER_URL);
  console.log(data, '查询所有用户');
  
  return {
    code: data.code,
    data: data.data,
    errMsg: data.errMsg
  };
};

// 新增用户
export const reqAddUser = (params: CreateUserParams) => 
  request.post<CreateUserResponse>(API.ADDUSER_URL, params);

// 删除用户
export const reqDelUser = (params: DeleteUserParams) => 
  request.post<DeleteUserResponse>(API.DELETEUSER_URL, params, { isForm: true });

// 修改用户
export const reqEditUser = (params: UpdateUserParams) => 
  request.post<UpdateUserResponse>(API.EDITUSER_URL, params);