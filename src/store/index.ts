// 
import { createPinia } from "pinia";

// piniaPluginPersistedstate 持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)

export default pinia;