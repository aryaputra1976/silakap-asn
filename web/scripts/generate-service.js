const fs = require("fs")
const path = require("path")

const serviceName = process.argv[2]

if (!serviceName) {
  console.log("Gunakan: npm run make:service <nama-service>")
  process.exit(1)
}

const baseDir = path.join(
  __dirname,
  "../src/features/services",
  serviceName
)

const folders = [
  "api",
  "components",
  "pages",
  "types",
]

folders.forEach((folder) => {
  fs.mkdirSync(path.join(baseDir, folder), { recursive: true })
})

function write(file, content) {
  fs.writeFileSync(path.join(baseDir, file), content)
}

const pascal =
  serviceName.charAt(0).toUpperCase() +
  serviceName.slice(1)

write(
  "config.tsx",
`export default {
  code: "${serviceName.toUpperCase()}",
  name: "${pascal}",
  icon: "briefcase"
}
`
)

write(
  "document.config.ts",
`export const documentConfig = [
  {
    code: "DOC_1",
    name: "Dokumen Wajib"
  }
]
`
)

write(
  "schema.ts",
`export const schema = [
  {
    name: "keterangan",
    label: "Keterangan",
    type: "text"
  }
]
`
)

write(
  "types/" + serviceName + ".types.ts",
`export interface ${pascal}Detail {
  id: string
}
`
)

write(
  "api/" + serviceName + ".api.ts",
`export async function get${pascal}List() {
  return []
}
`
)

write(
  "pages/" + pascal + "ListPage.tsx",
`export default function ${pascal}ListPage() {
  return <div>${pascal} List</div>
}
`
)

write(
  "pages/" + pascal + "CreatePage.tsx",
`export default function ${pascal}CreatePage() {
  return <div>Create ${pascal}</div>
}
`
)

write(
  "pages/" + pascal + "DetailPage.tsx",
`export default function ${pascal}DetailPage() {
  return <div>${pascal} Detail</div>
}
`
)

console.log("Service module dibuat:", serviceName)