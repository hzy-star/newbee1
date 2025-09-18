<template>
  <div class="login-container">
    <el-row>
      <el-col :span="12" :xs="0"></el-col>
      <el-col :span="12" :xs="24">
        <el-form class="login_form" :model="loginForm" :rules="rules" ref="loginFormRef">
          <h1>hello</h1>
          <h2>Welcome to Pushnode</h2>
          <el-form-item prop="name">
            <el-input v-model="loginForm.name" placeholder="Please input" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" placeholder="Please input" :prefix-icon="Lock" show-password
              type="password" @keyup.enter="handleLogin"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button :loading="loading" class="login_btn" type="primary" size="default"
              @click="handleLogin">Login</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted } from "vue";
import { User, Lock } from "@element-plus/icons-vue";
import useUserStore from "@/store/modules/user";
import { ElNotification } from "element-plus";
import { getTime } from "@/utils/time";
const loading = ref(false);
const userStore = useUserStore();
let loginForm = reactive({
  name: "",
  password: "",
});
const loginFormRef = ref();
// 登录
const handleLogin = async () => {
  loginFormRef.value.validate(async (valid: boolean | undefined) => {
    if (valid) {
      loading.value = true;
      // 通知仓库发起登录请求
      try {
        await userStore.userLogin(loginForm);
        // 登录成功后提示
        ElNotification({
          title: getTime(),
          message: "登录成功",
          type: "success",
        });
        loading.value = false;
      } catch (error) {
        // 登录失败后提示
        ElNotification({
          title: "警告",
          message: '登录失败,请检查账号密码',
          type: "warning",
        });
        loading.value = false;
      }
    }
  });
};

// 定义校验对象
const rules = {
  name: [
    { required: true, message: "请输入账号", trigger: "blur" },
    // { min: 5, max: 10, message: "账号长度为5-10位", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    // { min: 6, max: 11, message: "密码长度为6-11位", trigger: "blur" },
  ],
};
</script>

<style scoped lang="scss">
.login-container {
  width: 100%;
  height: 100vh;
  background: url("@/assets/images/background.jpg") no-repeat;
  background-size: cover;

  .login_form {
    position: relative;
    width: 80%;
    top: 30vh;
    background: url("@/assets/images/login_form.png") no-repeat;
    background-size: cover;
    padding: 40px;

    h1 {
      color: #dfa212;
      font-size: 40px;
    }

    h2 {
      color: #cedf12;
      font-size: 20px;
      margin: 10px 0;
    }

    .login_btn {
      width: 100%;
    }
  }
}
</style>
