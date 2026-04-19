import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { workflowDispatcher } from "../../workflow/workflow.dispatcher"

export default function ServiceVerifyPage() {

  const params = useParams()
  const navigate = useNavigate()

  const service = params.service as string
  const id = params.id as string

  const [loading, setLoading] = useState(false)

  if (!service || !id) {
    return <div>Data tidak ditemukan</div>
  }

  async function handleApprove() {

    try {

      setLoading(true)

      await workflowDispatcher(service, id, "approve")

      navigate(-1)

    } finally {

      setLoading(false)

    }

  }

  async function handleReject() {

    try {

      setLoading(true)

      await workflowDispatcher(service, id, "reject")

      navigate(-1)

    } finally {

      setLoading(false)

    }

  }

  return (

    <div className="card">

      <div className="card-body text-center">

        <button
          className="btn btn-success me-2"
          disabled={loading}
          onClick={handleApprove}
        >
          Approve
        </button>

        <button
          className="btn btn-danger"
          disabled={loading}
          onClick={handleReject}
        >
          Reject
        </button>

      </div>

    </div>

  )
}
