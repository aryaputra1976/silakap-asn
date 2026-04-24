// web/src/_metronic/layout/components/header/HeaderToolbar.tsx

import React from "react"
import { Topbar } from "./Topbar"

export function HeaderToolbar(): React.ReactElement {
  return (
    <div className="d-flex align-items-stretch justify-content-between flex-lg-grow-1">
      <div className="d-flex align-items-center flex-wrap me-3" />
      <div className="d-flex align-items-center flex-shrink-0">
        <Topbar />
      </div>
    </div>
  )
}

export default HeaderToolbar