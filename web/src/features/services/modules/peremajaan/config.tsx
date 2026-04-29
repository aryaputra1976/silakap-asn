import { registerService } from "../../base/registry"
import PeremajaanDashboard from "./components/PeremajaanDashboard"
import PeremajaanForm from "./components/PeremajaanForm"

registerService({
  key: "peremajaan",
  name: "Peremajaan Data ASN",
  description: "Ajukan koreksi atau pembaruan data identitas pegawai",
  form: PeremajaanForm,
  dashboard: {
    override: PeremajaanDashboard,
  },
})
