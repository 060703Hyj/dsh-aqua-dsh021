// 发布前自检：确认包结构、模块 id、依赖名、补丁一致。
// 用法：node verify.mjs
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
const fail = []
const ok = (message) => console.log('  OK   ' + message)
const bad = (message) => { fail.push(message); console.log('  FAIL ' + message) }

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

console.log('\n[1] package.json')
pkg.private === undefined ? ok('不是 private') : bad('仍是 private: true，npm 会拒绝发布')
pkg.name === '@yourname/dsh-client-ui-aqua'
  ? bad('包名还是占位符 @yourname/...，发布前要换成你的')
  : ok('包名已改: ' + pkg.name)
pkg.dsh?.bundle?.patch === './cordis.patch.yml' ? ok('dsh.bundle.patch 已声明') : bad('缺 dsh.bundle.patch')
pkg.dsh?.client?.platform === 'web' ? ok('dsh.client.platform = web') : bad('dsh.client.platform 不是 web')
pkg.license === 'AGPL-3.0' ? ok('license = AGPL-3.0') : bad('license 应为 AGPL-3.0')

console.log('\n[2] exports 指向的文件')
for (const [key, target] of Object.entries(pkg.exports)) {
  if (typeof target !== 'string') { bad(`${key} 不是字符串路径`); continue }
  existsSync(join(ROOT, target)) ? ok(`${key} -> ${target}`) : bad(`${key} -> ${target} 不存在`)
}

console.log('\n[3] files 白名单')
for (const entry of pkg.files ?? []) {
  const hit = existsSync(join(ROOT, entry))
  hit ? ok(entry) : bad(`files 里的 ${entry} 不存在`)
}

console.log('\n[4] client bundle 的模块 id 与包名一致')
const client = readFileSync(join(ROOT, 'lib/client.js'), 'utf8')
const idMatch = /__ModuleLoader__\.load\(\{\s*id:\s*"([^"]+)"/.exec(client)
if (idMatch === null) bad('没找到 __ModuleLoader__.load({ id })')
else if (idMatch[1] !== pkg.name) bad(`id="${idMatch[1]}" 与包名 "${pkg.name}" 不一致（会报 loaded without registering）`)
else ok(`id = ${idMatch[1]}`)

console.log('\n[5] 适配改动是否都在')
// 头部有一段说明注释，里面会提到旧名字（"xxx -> yyy"），
// 所以先剥掉开头的块注释再检查，否则会把文档当成残留代码。
const code = client.replace(/^\/\*\*[\s\S]*?\*\/\s*/, '')
const checks = [
  ['dsh-client-store 替换', /dsh-client-store/.test(code) && !/dsh-client-runtime\/client/.test(code)],
  ['图标改名', /IconCheckOutlineRegular/.test(code) && !/IconCheckOutline16/.test(code)],
  ['插槽改名', /settings\.plugins\.tab/.test(code) && !/settings\.plugin\.item/.test(code)],
  ['布局补丁', /DSH021_LAYOUT_CSS/.test(code)],
]
for (const [name, pass] of checks) pass ? ok(name) : bad(name)

console.log('\n[6] 补丁文件里的 name 与包名一致')
const patch = readFileSync(join(ROOT, 'cordis.patch.yml'), 'utf8')
patch.includes(`'${pkg.name}'`) ? ok('cordis.patch.yml 的 name 匹配') : bad('cordis.patch.yml 的 name 与 package.json 不一致')
if (/[A-Za-z]:[\\/]/.test(patch)) bad('cordis.patch.yml 里还有绝对路径（Windows 盘符）')
else ok('没有绝对路径')

console.log('\n[7] 法务文件')
for (const file of ['LICENSE', 'NOTICE.md', 'README.md']) {
  existsSync(join(ROOT, file)) ? ok(file) : bad(`缺 ${file}`)
}
const license = readFileSync(join(ROOT, 'LICENSE'), 'utf8')
license.includes('GNU AFFERO GENERAL PUBLIC LICENSE') ? ok('LICENSE 是 AGPL 全文') : bad('LICENSE 不是 AGPL')

console.log('\n' + '─'.repeat(56))
if (fail.length === 0) {
  console.log('全部通过。')
  process.exit(0)
}
console.log(`${fail.length} 项待修：`)
for (const item of fail) console.log('  - ' + item)
process.exit(1)
