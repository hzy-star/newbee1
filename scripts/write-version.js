import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// 获取当前文件的目录路径（ESM 方式）
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 生成版本号：时间戳 + 随机值（避免缓存）
const now = new Date()
const version =
  now.toISOString().replace(/[-:T]/g, '').slice(0, 15) +
  '_' +
  Math.random().toString(36).slice(2, 6)

// public 目录路径
const publicDir = path.resolve(__dirname, '../public')

// 确保 public 目录存在
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

// 写入 version.txt
fs.writeFileSync(path.join(publicDir, 'version.txt'), version)

console.log(`[VersionCheck] 生成 version.txt: ${version}`)