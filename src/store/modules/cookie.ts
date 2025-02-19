// 关于layout组件相关配置
import { defineStore } from "pinia";
import { localCache } from "@/utils/cache";
import { reqGetUserInfo } from "@/api/user";
import rolePermission from "./rolePermission"
const useCookie = defineStore("setCookie", {
  state: () => {
    return {
      cookie: localCache.getCache("cookie")?.value || "", // 存储cookie
      cookieExpireTime: localCache.getCache("cookie")?.timestamp || 0,
      username: localCache.getCache("username") || "", // 存储用户名
      avatar:
        "https://www.eclicktech.com.cn/static/style/pc/2022/i/favicon.png", // 存储头像
    };
  },
  actions: {
    setCookie(cookie: string) {
      const cookieData = {
        value: cookie,
        timestamp: Date.now(), // 存储当前时间戳
      };
      this.cookie = cookie;
      this.cookieExpireTime = cookieData.timestamp;
      localCache.setCache("cookie", cookieData);
    },
    getCookie() {
      const now = Date.now();
      const cookieAge = now - this.cookieExpireTime;
      const hourInMs = 24 * 60 * 60 * 1000 // 24小时的毫秒数
    //   const hourInMs = 10000; // 测试10秒钟的毫秒数

      if (cookieAge > hourInMs || document.cookie === "") {
        // cookie已过期，清除
        this.clearCookie();
        return "";
      }
      return this.cookie;
    },
    clearCookie() {
      this.cookie = "";
      this.username = "";
      localCache.removeCache("cookie");
      localCache.removeCache("username");
      // 清除权限按钮
      const Permission = rolePermission()
      Permission.setBtnShow('');
      localStorage.clear();
      this.clearAllCookies(); // 清除所有本地储存的cookie
    },
    // 获取用户信息(新)
    async getUserInfoNew() {
      let res = await reqGetUserInfo();
      this.username = res;
      // 获取权限按钮
      const Permission = rolePermission()
      Permission.setBtnShow(res);
      localCache.setCache("username", res);
      return res;
    },
    // 清除所有本地储存的cookie
    async clearAllCookies() {
      const cookies = document.cookie.split(";");

      for (const cookie of cookies) {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    },
  },
});

export default useCookie;
