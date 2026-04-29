// web/src/features/profil-asn/components/UnitTreeCombobox.tsx
import { useEffect, useRef, useState } from "react"
import type { MouseEvent as ReactMouseEvent } from "react"
import { UnitTree } from "./UnitTree"

type Props = {
  selected?: number
  valueLabel?: string
  placeholder?: string
  onSelect: (id: number, name?: string) => void
  onClear: () => void
}

export function UnitTreeCombobox({
  selected,
  valueLabel,
  placeholder = "Semua Unit Organisasi",
  onSelect,
  onClear,
}: Props) {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState("")
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return

      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const hasSelection = selected !== undefined || Boolean(valueLabel)
  const hasKeyword = keyword.trim().length > 0

  const handleSelect = (id: number, name?: string) => {
    onSelect(id, name)
    setKeyword("")
    setOpen(false)
  }

  const handleClearSelection = (event?: ReactMouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation()
    onClear()
    setKeyword("")
  }

  const handleClearKeyword = (event?: ReactMouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation()
    setKeyword("")
  }

  return (
    <div className="position-relative w-100" ref={containerRef}>
      <div className="form-control form-control-lg form-control-solid d-flex align-items-center gap-2 px-3 overflow-hidden">
        <button
          type="button"
          className="btn border-0 shadow-none p-0 d-flex align-items-center gap-3 flex-grow-1 min-w-0 text-start"
          onClick={() => setOpen((prev) => !prev)}
        >
          <i className="ki-duotone ki-geolocation-home fs-3 text-primary flex-shrink-0">
            <span className="path1" />
            <span className="path2" />
          </i>

          <div className="d-flex align-items-center gap-2 min-w-0 flex-grow-1 overflow-hidden">
            {hasSelection ? (
              <span className="badge badge-light-success fw-bold fs-8 flex-shrink-0 d-none d-md-inline-flex">
                Dipilih
              </span>
            ) : null}

            <span
              className={`text-truncate min-w-0 ${
                hasSelection ? "text-gray-900 fw-semibold" : "text-gray-500"
              }`}
              title={valueLabel || placeholder}
            >
              {valueLabel || placeholder}
            </span>
          </div>
        </button>

        {hasSelection ? (
          <button
            type="button"
            className="btn btn-icon btn-sm btn-light-danger flex-shrink-0"
            onClick={handleClearSelection}
            title="Hapus pilihan unit"
          >
            <i className="ki-duotone ki-cross fs-4">
              <span className="path1" />
              <span className="path2" />
            </i>
          </button>
        ) : null}

        <button
          type="button"
          className="btn btn-icon btn-sm btn-light flex-shrink-0"
          onClick={() => setOpen((prev) => !prev)}
          title={open ? "Tutup daftar unit" : "Buka daftar unit"}
        >
          <i
            className={`ki-duotone ${open ? "ki-up" : "ki-down"} fs-4 text-gray-700`}
          >
            <span className="path1" />
            <span className="path2" />
          </i>
        </button>
      </div>

      {open ? (
        <div
          className="card shadow-lg border-0 position-absolute start-0 mt-2"
          style={{
            width: "100%",
            minWidth: "min(420px, calc(100vw - 48px))",
            maxWidth: "560px",
            zIndex: 1050,
          }}
        >
          <div className="card-body p-4">
            <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="fw-bolder text-gray-900 fs-5">
                  Pilih Unit Organisasi
                </div>
                <div className="text-muted fs-7">
                  Cari unit, lalu pilih langsung dari tree.
                </div>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-light flex-shrink-0"
                onClick={() => setOpen(false)}
              >
                Tutup
              </button>
            </div>

            <div className="position-relative mb-4">
              <i className="ki-duotone ki-magnifier fs-2 text-gray-500 position-absolute top-50 translate-middle-y ms-4">
                <span className="path1" />
                <span className="path2" />
              </i>

              <input
                type="text"
                className="form-control form-control-solid ps-12 pe-12"
                placeholder="Cari nama unit organisasi..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                autoComplete="off"
                spellCheck={false}
              />

              {hasKeyword ? (
                <button
                  type="button"
                  className="btn btn-icon btn-sm btn-light-danger position-absolute top-50 end-0 translate-middle-y me-3"
                  onClick={handleClearKeyword}
                  title="Hapus pencarian"
                >
                  <i className="ki-duotone ki-cross fs-4">
                    <span className="path1" />
                    <span className="path2" />
                  </i>
                </button>
              ) : null}
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3 gap-3">
              <div className="fw-bold text-gray-800 fs-7 text-uppercase">
                Tree Unit Organisasi
              </div>

              {hasSelection ? (
                <button
                  type="button"
                  className="btn btn-sm btn-light-danger"
                  onClick={handleClearSelection}
                >
                  Clear pilihan
                </button>
              ) : null}
            </div>

            <div
              className="rounded border border-gray-200 p-2"
              style={{ maxHeight: 420, overflowY: "auto" }}
            >
              <UnitTree
                selected={selected}
                keyword={keyword}
                onSelect={handleSelect}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}