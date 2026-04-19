import { useAsnStatistics } from "../hooks/useAsnStatistics"

import JabatanChart from "../components/charts/JabatanChart"
import PendidikanChart from "../components/charts/PendidikanChart"
import GenderChart from "../components/charts/GenderChart"

export default function DistributionPage() {

  const { data, isLoading, isError } = useAsnStatistics()

  if (isLoading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Memuat distribusi ASN...
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-10 text-center text-red-500">
        Data distribusi ASN tidak tersedia
      </div>
    )
  }

  const jabatan = data.distribution?.jabatan ?? []
  const pendidikan = data.distribution?.pendidikan ?? []
  const gender = data.distribution?.gender ?? []

  return (

    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div>
        <h2 className="text-xl font-semibold">
          Distribusi ASN
        </h2>

        <p className="text-gray-500 text-sm">
          Struktur ASN berdasarkan jabatan, pendidikan, dan jenis kelamin.
        </p>
      </div>


      {/* DISTRIBUSI JABATAN */}

      <div className="card">

        <div className="card-header">
          <h3 className="card-title">
            Distribusi Jabatan
          </h3>
        </div>

        <div className="card-body">

          {jabatan.length > 0 ? (
            <JabatanChart data={jabatan} />
          ) : (
            <div className="text-gray-400 text-center py-8">
              Data jabatan belum tersedia
            </div>
          )}

        </div>

      </div>


      {/* GRID DISTRIBUSI */}

      <div className="grid grid-cols-12 gap-6">

        {/* PENDIDIKAN */}

        <div className="col-span-12 xl:col-span-6">

          <div className="card">

            <div className="card-header">
              <h3 className="card-title">
                Distribusi Pendidikan
              </h3>
            </div>

            <div className="card-body">

              {pendidikan.length > 0 ? (
                <PendidikanChart data={pendidikan} />
              ) : (
                <div className="text-gray-400 text-center py-8">
                  Data pendidikan belum tersedia
                </div>
              )}

            </div>

          </div>

        </div>


        {/* GENDER */}

        <div className="col-span-12 xl:col-span-6">

          <div className="card">

            <div className="card-header">
              <h3 className="card-title">
                Distribusi Jenis Kelamin
              </h3>
            </div>

            <div className="card-body">

              {gender.length > 0 ? (
                <GenderChart data={gender} />
              ) : (
                <div className="text-gray-400 text-center py-8">
                  Data jenis kelamin belum tersedia
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>

  )
}