import { registerService } from "../../base/registry"

import KgbForm from "./components/KgbForm"

registerService({
  key: "kgb",
  name: "Usulan KGB",
  form: KgbForm,
})
