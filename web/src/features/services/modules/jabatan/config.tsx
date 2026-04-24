import { registerService } from "../../base/registry"

import JabatanForm from "./components/JabatanForm"

registerService({
  key: "jabatan",
  name: "Usulan Jabatan",
  form: JabatanForm,
})
