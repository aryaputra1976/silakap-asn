import { useNavigate } from "react-router-dom"
import { useCreatePensiun } from "../hooks/useCreatePensiun"
import { PensiunForm } from "../components/PensiunForm"
import { LayananFormLayout } from "@/features/layanan/_shared/components/LayananFormLayout"

export default function PensiunCreatePage() {
  const navigate = useNavigate()
  const mutation = useCreatePensiun()

  function handleSubmit(data: any) {
    mutation.mutate(data, {
      onSuccess: () => navigate("/layanan/pensiun"),
    })
  }

  return (
    <LayananFormLayout
      title="Buat Usulan Pensiun"
      onCancel={() => navigate(-1)}
    >
      <PensiunForm
        onSubmit={handleSubmit}
        loading={mutation.isPending}
      />
    </LayananFormLayout>
  )
}