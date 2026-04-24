import { uploadDocument } from "../api/document.api"

export default function DocumentUpload({
  service,
  id,
  docKey,
  onUploaded,
}: any) {

  async function handleFile(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    const file = e.target.files?.[0]

    if (!file) return

    await uploadDocument(service, id, docKey, file)

    alert("Upload berhasil")
    onUploaded?.()

  }

  return (

    <input
      type="file"
      className="form-control"
      onChange={handleFile}
    />

  )

}
