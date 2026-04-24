import { registerService } from "../../base/registry"

import MutasiForm from "./components/MutasiForm"

registerService({
  key: "mutasi",
  name: "Usulan Mutasi",
  form: MutasiForm,
})
