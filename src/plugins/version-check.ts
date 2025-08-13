import { App } from 'vue'
import { ElMessageBox } from 'element-plus'

interface VersionCheckOptions {
  url?: string         // 版本文件地址
  interval?: number    // 检测间隔(毫秒)
}

export default {
  install(app: App, options: VersionCheckOptions = {}) {
    const versionUrl = options.url || '/version.txt'
    const checkInterval = options.interval || 60 * 1000

    let currentVersion: string | null = null

    async function checkVersion() {
      try {
        const res = await fetch(`${versionUrl}?t=${Date.now()}`, { cache: 'no-store' })
        const text = (await res.text()).trim()

        if (!currentVersion) {
          currentVersion = text
          return
        }

        if (currentVersion !== text) {
          ElMessageBox.confirm(
            '检测到新版本，是否刷新页面？',
            '更新提示',
            { confirmButtonText: '刷新', cancelButtonText: '稍后', type: 'warning' }
          ).then(() => {
            location.reload()
          }).catch(() => {
            // 用户取消，不刷新
          })
        }
      } catch (err) {
        console.error('[VersionCheck] 检查版本失败', err)
      }
    }

    // 立即检测一次
    checkVersion()
    // 定时检测
    setInterval(checkVersion, checkInterval)
  }
}
