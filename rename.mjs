// 一键把占位符换成真实包名 / 仓库地址。
//
// 为什么需要脚本：包名出现在 3 个地方，漏改一个就会装不上——
//   1. package.json 的 name
//   2. cordis.patch.yml 的 name（宿主按它匹配模块行）
//   3. lib/client.js 的 __ModuleLoader__.load({ id })（不匹配会报 loaded without registering）
// 另外 repository / bugs / homepage 与 README 里的链接也要换。
//
// 用法：
//   node rename.mjs --pkg @lilith/dsh-client-ui-aqua --repo lilith/dsh-aqua-dsh021
//   node rename.mjs --pkg dsh-client-ui-aqua-dsh021 --repo lilith/dsh-aqua-dsh021
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
const OLD_PKG = '@yourname/dsh-client-ui-aqua'
const OLD_REPO = 'yourname/dsh-aqua-dsh021'

const args = process.argv.slice(2)
const read = (flag) => {
  const index = args.indexOf(flag)
  return index >= 0 ? args[index + 1] : undefined
}

const newPkg = read('--pkg')
const newRepo = read('--repo')

if (newPkg === undefined || newRepo === undefined) {
  console.error('用法: node rename.mjs --pkg <包名> --repo <用户名/仓库名>')
  console.error('例:   node rename.mjs --pkg @lilith/dsh-client-ui-aqua --repo lilith/dsh-aqua-dsh021')
  process.exit(2)
}

if (!/^(@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(newPkg)) {
  console.error(`包名不合法: ${newPkg}`)
  console.error('npm 规则：全小写，可用 - . _ 和 @scope/ 前缀，不能有空格或大写')
  process.exit(2)
}
if (!/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9._-]+$/.test(newRepo)) {
  console.error(`仓库名不合法: ${newRepo}（应为 用户名/仓库名）`)
  process.exit(2)
}

/** 读 → 替换 → 写；返回替换次数。 */
function rewrite(relative, pairs) {
  const file = join(ROOT, relative)
  const before = readFileSync(file, 'utf8')
  let after = before
  for (const [from, to] of pairs) after = after.split(from).join(to)
  if (after !== before) writeFileSync(file, after, 'utf8')
  const changed = pairs.reduce((sum, [from]) => sum + before.split(from).length - 1, 0)
  console.log(`  ${changed > 0 ? 'UPDATED' : 'unchanged'}  ${relative}${changed > 0 ? ` (${changed} 处)` : ''}`)
  return changed
}

const pairs = [
  [OLD_PKG, newPkg],
  [OLD_REPO, newRepo],
]

console.log('改名中…')
let total = 0
total += rewrite('package.json', pairs)
total += rewrite('cordis.patch.yml', pairs)
total += rewrite('lib/client.js', pairs)
total += rewrite('README.md', pairs)
total += rewrite('NOTICE.md', pairs)

console.log(`\n共替换 ${total} 处。`)
console.log(`包名：${newPkg}`)
console.log(`仓库：https://github.com/${newRepo}`)
console.log('\n下一步：node verify.mjs 复查')
