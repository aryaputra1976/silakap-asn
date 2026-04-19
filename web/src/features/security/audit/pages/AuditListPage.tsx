import { useQuery } from '@tanstack/react-query'
import httpClient from '@/core/http/httpClient'
import { useState } from 'react'

export default function AuditListPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['auditLog', page],
    queryFn: async ({ signal }) => {
      const res = await httpClient.get('/security/audit', {
        signal,
        params: { page },
      })
      return res.data
    },
    placeholderData: (prev) => prev,
  })

  if (isLoading) return <div>Memuat audit log...</div>

  return (
    <div className="card">
      <div className="card-header">
        <h3>Audit Log</h3>
      </div>

      <div className="card-body">
        <table className="table table-row-dashed">
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((log: any) => (
              <tr key={log.id}>
                <td>{log.user?.username}</td>
                <td>{log.action}</td>
                <td>{log.entity}</td>
                <td>
                  {new Date(log.createdAt).toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}