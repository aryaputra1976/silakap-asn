export function loadModules() {

  const modules = import.meta.glob(
    "/src/features/**/config.ts",
    { eager: true }
  )

  Object.values(modules)

}