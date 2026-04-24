import { KTIcon } from "@/_metronic/helpers"
import clsx from "clsx"
import type { MasterColumn, SortOrder } from "../types"

type Props<T> = {
  data: T[]
  columns: MasterColumn<T>[]
  loading: boolean
  sort?: string
  order?: SortOrder
  canEdit?: boolean
  canDelete?: boolean
  onSortChange: (key: string) => void
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  onToggleActive: (item: T) => void
  togglingId: bigint | null
}

export function MasterTable<
  T extends { id: bigint; isActive: boolean }
>({
  data,
  columns,
  loading,
  sort,
  order,
  canEdit = false,
  canDelete = false,
  onSortChange,
  onEdit,
  onDelete,
  onToggleActive,
  togglingId,
}: Props<T>) {
  if (loading) {
    return (
      <div className="d-flex justify-content-center py-10">
        <span className="spinner-border text-primary" />
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle table-row-dashed fs-6 gy-5">
        <thead>
          <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={clsx(
                  col.sortable && "cursor-pointer",
                  "user-select-none"
                )}
                onClick={() =>
                  col.sortable && onSortChange(String(col.key))
                }
              >
                <div className="d-flex align-items-center gap-1">
                  {col.title}
                  {sort === col.key && (
                    <KTIcon
                      iconName={
                        order === "asc" ? "arrow-up" : "arrow-down"
                      }
                      className="fs-6 text-gray-600"
                    />
                  )}
                </div>
              </th>
            ))}
            <th className="text-end min-w-125px">Aksi</th>
          </tr>
        </thead>

        <tbody className="text-gray-700 fw-semibold">
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={String(item.id)} className="hover-elevate-up">
                {columns.map((col) => (
                  <td key={String(col.key)}>
                    {col.render
                      ? col.render(item)
                      : (item as any)[col.key]}
                  </td>
                ))}

                <td className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    {canEdit && (
                      <button
                        className="btn btn-icon btn-light-primary btn-sm btn-active-color-primary"
                        title="Edit"
                        onClick={() => onEdit(item)}
                      >
                        <KTIcon iconName="pencil" />
                      </button>
                    )}

                    {canEdit && (
                      <button
                        className="btn btn-icon btn-light-warning btn-sm btn-active-color-warning"
                        title={item.isActive ? "Nonaktifkan" : "Aktifkan"}
                        onClick={() => onToggleActive(item)}
                        disabled={togglingId === item.id}
                      >
                        {togglingId === item.id ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          <KTIcon iconName="arrows-circle" />
                        )}
                      </button>
                    )}

                    {canDelete && (
                      <button
                        className="btn btn-icon btn-light-danger btn-sm btn-active-color-danger"
                        title="Hapus"
                        onClick={() => onDelete(item)}
                      >
                        <KTIcon iconName="trash" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="py-15 text-center">
                <div className="d-flex flex-column align-items-center gap-3">
                  <div className="symbol symbol-60px">
                    <span className="symbol-label bg-light-primary">
                      <KTIcon
                        iconName="abstract-26"
                        className="fs-1 text-primary"
                      />
                    </span>
                  </div>
                  <div className="fw-bold fs-4 text-gray-800">
                    Belum ada data yang cocok
                  </div>
                  <div className="text-gray-600 fs-6 mw-450px">
                    Coba ubah kata kunci pencarian atau filter status untuk
                    melihat data master yang tersedia.
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
