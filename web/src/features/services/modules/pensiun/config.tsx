import { registerService } from "../../base/registry"

import PensiunForm from "./components/PensiunForm"

/* ================= SERVICE REGISTRY ================= */

registerService({
  key: "pensiun",
  name: "Usulan Pensiun",
  form: PensiunForm,
})
