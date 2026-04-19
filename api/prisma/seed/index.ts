import { seedRBAC } from './rbac.seed'

async function main() {
  await seedRBAC()
}

main().catch(console.error)