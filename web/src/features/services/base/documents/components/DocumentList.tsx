import DocumentItem from "./DocumentItem"
import { useServiceDocuments } from "../hooks/useServiceDocuments"

export default function DocumentList({
  configs,
  service,
  id,
}: any) {
  const {
    documents,
    loading,
    reload,
  } = useServiceDocuments(service, id)

  const documentMap = new Map(
    (documents ?? []).map((document: any) => [
      document.key,
      document,
    ])
  )

  return (

    <table className="table">

      <thead>

        <tr>

          <th>Dokumen</th>
          <th>Upload</th>

        </tr>

      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td colSpan={2} className="text-muted">
              Memuat dokumen...
            </td>
          </tr>
        ) : null}

        {configs.map((c: any) => (

          <DocumentItem
            key={c.key}
            config={c}
            service={service}
            id={id}
            document={documentMap.get(c.key)}
            onUploaded={reload}
          />

        ))}

      </tbody>

    </table>

  )

}
