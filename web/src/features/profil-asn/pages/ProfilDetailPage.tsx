import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"

import { useAsnDetail } from "../hooks/useAsnDetail"
import { AsnHeaderCard } from "../components/AsnHeaderCard"
import { AsnTabs } from "../components/AsnTabs"
import { AsnProfileTab } from "../components/AsnProfileTab"
import { AsnJabatanTab } from "../tabs/AsnJabatanTab"

export default function ProfilDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, loading } = useAsnDetail(id)

  const [tab, setTab] = useState("profil")

  const goBack = () => {
    navigate("/asn/profil")
  }

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-10">
          Loading data ASN...
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="card">
        <div className="card-body text-center py-10">
          Data ASN tidak ditemukan
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid">

      {/* Breadcrumb */}
      <div className="d-flex flex-column mb-5">

        <div className="d-flex align-items-center gap-4 mb-2">

          <button
            className="btn btn-sm btn-light-primary"
            onClick={goBack}
          >
            ← Kembali
          </button>

          <div className="text-muted fs-7">
            <span
              className="cursor-pointer text-hover-primary"
              onClick={goBack}
            >
              Profil ASN
            </span>

            <span className="mx-2">/</span>

            <span className="fw-semibold text-dark">
              Detail ASN
            </span>
          </div>

        </div>

      </div>

      {/* Header ASN */}
      <AsnHeaderCard asn={data} />

      {/* Tabs */}
      <AsnTabs active={tab} onChange={setTab} />

      {/* TAB CONTENT */}

      {tab === "profil" && (
        <AsnProfileTab asn={data} />
      )}

      {tab === "jabatan" && (
        <AsnJabatanTab />
      )}

      {tab === "pangkat" && (
        <div className="card">
          <div className="card-body">
            Riwayat Pangkat
          </div>
        </div>
      )}

      {tab === "pendidikan" && (
        <div className="card">
          <div className="card-body">
            Riwayat Pendidikan
          </div>
        </div>
      )}

      {tab === "diklat" && (
        <div className="card">
          <div className="card-body">
            Riwayat Diklat
          </div>
        </div>
      )}

    </div>
  )
}