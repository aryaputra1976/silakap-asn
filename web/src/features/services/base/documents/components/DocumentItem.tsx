import DocumentUpload from "./DocumentUpload"

export default function DocumentItem({
  config,
  service,
  id,
}: any) {

  return (

    <tr>

      <td>{config.label}</td>

      <td>

        <DocumentUpload
          service={service}
          id={id}
          docKey={config.key}
        />

      </td>

    </tr>

  )

}