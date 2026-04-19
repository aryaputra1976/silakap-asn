export default function ExplorerToolbar({ search, setSearch }: any) {

  return (

    <div className="mb-5">

      <input
        className="form-control"
        placeholder="Cari ASN..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

    </div>

  )

}