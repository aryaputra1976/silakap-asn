const fs = require('fs')
const path = require('path')

// ================= CASE HELPERS =================

function toPascal(str) {
  return str
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
}

function toSnake(str) {
  return str.replace(/-/g, '_')
}

function toUpper(str) {
  return toSnake(str).toUpperCase()
}

// ================= SCHEMA PARSER =================

function readSchema() {
  const schemaPath = path.join(__dirname, '../../prisma/schema.prisma')
  return fs.readFileSync(schemaPath, 'utf8')
}

function scanRefModels() {
  const schema = readSchema()
  const regex = /model\s+(ref_[a-zA-Z0-9_]+)/g
  const models = []
  let match
  while ((match = regex.exec(schema)) !== null) {
    models.push(match[1])
  }
  return models
}

function scanCoreMasters() {
  return [
    'silakap_instansi',
    'silakap_unit_kerja',
    'silakap_jabatan',
    'silakap_pangkat',
    'silakap_jenis_layanan',
  ]
}

function parseModelRelations(modelName) {
  const schema = readSchema()
  const modelRegex = new RegExp(`model\\s+${modelName}\\s+\\{([\\s\\S]*?)\\}`, 'm')
  const match = schema.match(modelRegex)
  if (!match) return []

  const body = match[1]
  const relationRegex = /^\s+(\w+)\s+(\w+)\[\]/gm

  const relations = []
  let r
  while ((r = relationRegex.exec(body)) !== null) {
    relations.push({
      field: r[1],
      model: r[2],
    })
  }

  return relations
}

// ================= TEMPLATE ENGINE =================

function resolveTemplatePath(type, file) {
  const base = path.join(__dirname, 'templates')
  const specific = path.join(base, type, file)
  const shared = path.join(base, 'shared', file)

  if (fs.existsSync(specific)) return specific
  if (fs.existsSync(shared)) return shared

  throw new Error(`Template not found: ${file}`)
}

function renderTemplate(templatePath, vars) {
  let content = fs.readFileSync(templatePath, 'utf8')

  Object.keys(vars).forEach(k => {
    content = content.replace(
      new RegExp(`__${k}__`, 'g'),
      vars[k]
    )
  })

  return content
}

function writeFileSafe(filePath, content) {
  if (fs.existsSync(filePath)) {
    console.warn(`⚠ Skip existing: ${filePath}`)
    return
  }
  fs.writeFileSync(filePath, content)
}

// ================= APP MODULE INJECTOR =================

function injectAppModule(pascal, kebab) {
  const appPath = path.join(__dirname, '../../src/app.module.ts')
  if (!fs.existsSync(appPath)) return

  let content = fs.readFileSync(appPath, 'utf8')

  const moduleClass = `${pascal}Module`
  const importLine = `import { ${moduleClass} } from '@/modules/master/${kebab}/${kebab}.module'`

  if (!content.includes(importLine)) {
    content = importLine + '\n' + content

    content = content.replace(
      /imports:\s*\[((?:.|\n)*?)\]/,
      (match, group) => {
        if (group.includes(moduleClass)) return match
        return `imports: [${group.trim()}
    ${moduleClass},
  ]`
      }
    )

    fs.writeFileSync(appPath, content)
    console.log('✅ Injected into AppModule')
  }
}

module.exports = {
  toPascal,
  toSnake,
  toUpper,
  scanRefModels,
  scanCoreMasters,
  parseModelRelations,
  resolveTemplatePath,
  renderTemplate,
  writeFileSafe,
  injectAppModule,
}