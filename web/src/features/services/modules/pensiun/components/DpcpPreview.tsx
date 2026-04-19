import React from "react"

interface Props {
  url?: string
}

export default function DpcpPreview({ url }: Props) {

  if (!url) {
    return (
      <div className="alert alert-light">
        Dokumen DPCP belum tersedia
      </div>
    )
  }

  return (
    <div style={{ width: "100%", height: "800px" }}>
      <iframe
        src={url}
        title="Preview DPCP"
        width="100%"
        height="100%"
        style={{ border: "none" }}
      />
    </div>
  )
}