import type { TimelineItem as Item } from '../types'

export default function TimelineItem({ item }: { item: Item }) {
  return (
    <div className="d-flex mb-5">
      <div className="me-4">
        <span className="bullet bullet-vertical h-40px bg-primary" />
      </div>

      <div className="flex-grow-1">
        <div className="fw-bold">
          {item.action} — {item.status}
        </div>

        <div className="text-muted fs-7">
          {item.actorName} ({item.actorRole})
        </div>

        {item.description && (
          <div className="text-gray-700">{item.description}</div>
        )}

        <div className="text-muted fs-8">{item.createdAt}</div>
      </div>
    </div>
  )
}