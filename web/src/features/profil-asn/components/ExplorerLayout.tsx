import React from "react"

interface Props {
  sidebar: React.ReactNode
  children: React.ReactNode
}

export default function ExplorerLayout({ sidebar, children }: Props) {

  return (

    <div className="d-flex align-items-start gap-4">

      {/* SIDEBAR */}

      <div
        style={{
          width: 300,
          minWidth: 280
        }}
      >

        <div
          className="card"
          style={{
            position: "sticky",
            top: 80,
            height: "calc(100vh - 100px)",
            display: "flex",
            flexDirection: "column"
          }}
        >

          {/* HEADER */}

<div className="card-header py-3 px-4 border-bottom">
  
  <div className="d-flex align-items-center gap-2 fw-semibold text-gray-800">

    <i className="ki-outline ki-folder text-warning fs-4"></i>

    <span>Unit Organisasi</span>

  </div>

</div>

          {/* BODY */}

          <div
            className="card-body p-3"
            style={{
              overflowY: "auto",
              flex: 1
            }}
          >

            {sidebar}

          </div>

        </div>

      </div>

      {/* CONTENT */}

      <div
        className="flex-grow-1"
        style={{ minWidth: 0 }}
      >

        {children}

      </div>

    </div>

  )

}