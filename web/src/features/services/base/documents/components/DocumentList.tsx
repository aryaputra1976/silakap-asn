import DocumentItem from "./DocumentItem"

export default function DocumentList({
  configs,
  service,
  id,
}: any) {

  return (

    <table className="table">

      <thead>

        <tr>

          <th>Dokumen</th>
          <th>Upload</th>

        </tr>

      </thead>

      <tbody>

        {configs.map((c: any) => (

          <DocumentItem
            key={c.key}
            config={c}
            service={service}
            id={id}
          />

        ))}

      </tbody>

    </table>

  )

}