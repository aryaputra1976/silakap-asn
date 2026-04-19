import { TimelineList } from '../components/TimelineList'

export default function MonitoringPage() {
  const logs: {
    id: string
    action: string
    actor: string
    status: string
    createdAt: string
  }[] = []

  return (
    <div className="container py-5">
      <h1 className="mb-5">Timeline Proses Layanan ASN</h1>
      <TimelineList logs={logs} />
    </div>
  )
}
