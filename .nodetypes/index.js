const compiler = require('vueify').compiler
const fs = require('fs')
const path = require('path')
process.env.NODE_ENV = 'production'
const types = process.argv.slice(2)
const child_process = require('child_process');

const src = path.resolve('./src')
if (!fs.existsSync(path.resolve('../dist')))
  fs.mkdirSync(path.resolve('../dist'))
if (!fs.existsSync(path.join(path.resolve('../dist'), 'build_nodetypes')))
  fs.mkdirSync(path.join(path.resolve('../dist'), 'build_nodetypes'))
const out = path.resolve('../dist/build_nodetypes')
const nodetypes = types.length && types || fs.readdirSync(src)
nodetypes.forEach(t => {
  const files = fs.readdirSync(path.join(src, t))
  if (!fs.existsSync(path.join(out, t)))
    fs.mkdirSync(path.join(out, t))

  files.forEach(f => {
    const filePath = path.join(src, t, f)
    if (fs.lstatSync(filePath).isDirectory()) return
    const fileContent = fs.readFileSync(path.join(src, t, f)).toString()
    if (f.slice(-3) != 'vue')
      fs.writeFileSync(path.join(out, t, f), fileContent)
    else
      compiler.compile(fileContent, path.join(src, t, f), (err, result) => {
        fs.writeFileSync(path.join(out, t, f.replace('.vue', '.vue.js')), result)
      })
  })
  if (fs.existsSync(path.join(out, t, 'package.json')) && !fs.existsSync(path.join(out, t, 'package-lock.json'))) {
    child_process.execSync(`cd ${path.join(out, t)} && npm install`)
  }

})