import DocumentUpload from "./DocumentUpload"
import { resolveDocumentUrl } from "../api/document.api"

export default function DocumentItem({
  config,
  service,
  id,
  document,
  onUploaded,
}: any) {
  const documentUrl = resolveDocumentUrl(document?.url)

  return (

    <tr>

      <td>{config.label}</td>

      <td>
        <div className="d-flex flex-column gap-2">
          {documentUrl ? (
            <div className="small text-success">
              Sudah diupload
            </div>
          ) : (
            <div className="small text-muted">
              Belum diupload
            </div>
          )}

          {documentUrl ? (
            <a
              href={documentUrl}
              target="_blank"
              rel="noreferrer"
              className="small"
            >
              Lihat dokumen
            </a>
          ) : null}

          <DocumentUpload
            service={service}
            id={id}
            docKey={config.key}
            onUploaded={onUploaded}
          />
        </div>

      </td>

    </tr>

  )

}
