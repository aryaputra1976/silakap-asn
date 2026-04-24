// web/src/_metronic/layout/components/Footer.tsx

import React from "react"

export function Footer(): React.ReactElement {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer py-4 d-flex flex-column flex-md-row align-items-center justify-content-between">
      <div className="text-gray-600 fw-semibold fs-7 order-2 order-md-1">
        © {currentYear} SILAKAP ASN · BKPSDM
      </div>

      <div className="text-gray-500 fw-medium fs-8 order-1 order-md-2 mb-2 mb-md-0">
        Sistem Layanan Kepegawaian ASN
      </div>
    </footer>
  )
}

export default Footer