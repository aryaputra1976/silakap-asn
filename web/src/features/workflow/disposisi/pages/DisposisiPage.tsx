import { useState } from "react"
import { DisposisiTable } from "../components/DisposisiTable"

export default function DisposisiPage() {

  const [data] = useState([])

  return (

    <div className="card">

      <div className="card-header">
        <h3 className="card-title">
          Disposisi Layanan
        </h3>
      </div>

      <div className="card-body">

        <DisposisiTable data={data} />

      </div>

    </div>

  )

}