const fs = require('fs')
const path = require('path')
const {
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
} = require('./utils')

const args = process.argv.slice(2)

const nameArg = args.find(a => !a.startsWith('--'))
const typeArg = args.find(a => a.startsWith('--type='))

const type = typeArg ? typeArg.split('=')[1] : null

const isAllRef = args.includes('--all-ref')
const isAllCore = args.includes('--all-core')
const isAllFull = args.includes('--all-full')

// ================= GENERATE FUNCTION =================

function generateOne(modelName, forcedType) {
  const isRef = modelName.startsWith('ref_')
  const finalType = forcedType || (isRef ? 'ref' : 'core')

  const snake = modelName
    .replace('ref_', '')
    .replace('silakap_', '')

  const kebab = snake.replace(/_/g, '-')
  const pascal = toPascal(kebab)
  const upper = toUpper(kebab)
  const table = modelName

  const baseDir = path.join(
    __dirname,
    '../../src/modules/master',
    kebab
  )

  if (fs.existsSync(baseDir)) {
    console.log(`⚠ Skip existing: ${kebab}`)
    return
  }

  fs.mkdirSync(path.join(baseDir, 'dto'), { recursive: true })

  const relations = parseModelRelations(modelName)

  let relationCheck = `    // No relational dependency\n`

  if (relations.length > 0) {
    relationCheck = relations.map(r => `
    const count_${r.field} = await tx.${r.model}.count({
      where: { ${snake}_id: id, deleted_at: null },
    })
    if (count_${r.field} > 0) {
      throw new Error(
        'Data tidak dapat dihapus karena masih direferensikan oleh ${r.model}'
      )
    }
  `).join('\n')
  }

  const variables = {
    PASCAL: pascal,
    KEBAB: kebab,
    UPPER: upper,
    TABLE: table,
    RELATION_CHECK: relationCheck,
  }

  const files = [
    ['controller.tpl', `${kebab}.controller.ts`],
    ['service.tpl', `${kebab}.service.ts`],
    ['repository.tpl', `${kebab}.repository.ts`],
    ['module.tpl', `${kebab}.module.ts`],
    ['create-dto.tpl', `dto/create-${kebab}.dto.ts`],
    ['update-dto.tpl', `dto/update-${kebab}.dto.ts`],
    ['query-dto.tpl', `dto/query-${kebab}.dto.ts`],
  ]

  files.forEach(([tpl, out]) => {
    const tplPath = resolveTemplatePath(finalType, tpl)
    const content = renderTemplate(tplPath, variables)
    writeFileSafe(path.join(baseDir, out), content)
  })

  injectAppModule(pascal, kebab)

  console.log(`✅ Generated: ${pascal}`)
}

// ================= EXECUTION MODES =================

if (isAllRef) {
  scanRefModels().forEach(m => generateOne(m, 'ref'))
}
else if (isAllCore) {
  scanCoreMasters().forEach(m => generateOne(m, 'core'))
}
else if (isAllFull) {
  scanRefModels().forEach(m => generateOne(m, 'ref'))
  scanCoreMasters().forEach(m => generateOne(m, 'core'))
}
else {
  if (!nameArg) {
    console.error('❌ Nama master wajib diisi')
    process.exit(1)
  }

  const modelName =
    nameArg.startsWith('ref_') || nameArg.startsWith('silakap_')
      ? nameArg
      : `ref_${toSnake(nameArg)}`

  generateOne(modelName, type)
}