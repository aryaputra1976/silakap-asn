import { registerModule } from "@/core/registry"

import ServiceListPage from "../../base/engine/pages/ServiceListPage"
import ServiceCreatePage from "../../base/engine/pages/ServiceCreatePage"
import ServiceDetailPage from "../../base/engine/pages/ServiceDetailPage"

import { registerService } from "../../base/registry"

import PensiunForm from "./components/PensiunForm"

/* ================= SERVICE REGISTRY ================= */

registerService({
  key: "pensiun",
  name: "Usulan Pensiun",
  form: PensiunForm,
})

/* ================= MODULE REGISTRY ================= */

registerModule({

  name: "pensiun",

  routes: [

    {
      path: "/layanan/pensiun",
      element: <ServiceListPage />,
    },

    {
      path: "/layanan/pensiun/create",
      element: <ServiceCreatePage />,
    },

    {
      path: "/layanan/pensiun/:id",
      element: <ServiceDetailPage />,
    },

  ],

  menus: [

    {
      label: "Usulan Pensiun",
      path: "/layanan/pensiun",
      icon: "users",
      permission: "service.pensiun.view",
    },

  ],

})