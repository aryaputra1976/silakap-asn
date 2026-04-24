// web/src/_metronic/layout/components/aside/AsideToolbar.tsx

import React from "react"
import { useNavigate } from "react-router-dom"
import { KTIcon } from "../../../helpers"
import { useAuthStore } from "@/stores/auth.store"
import { NAV_SEARCH_OPEN_EVENT } from "@/components/navigation/NavigationSearch"

export function AsideToolbar(): React.ReactElement {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const username = user?.username ?? "User"
  const primaryRole =
    user?.roles && user.roles.length > 0
      ? user.roles[0]
      : "USER"

  function openQuickSearch() {
    window.dispatchEvent(new Event(NAV_SEARCH_OPEN_EVENT))
  }

  return (
    <div id="kt_aside_toolbar" className="px-6 pt-6 pb-5">
      <div className="aside-user-card rounded-4 p-4 mb-5">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3 min-w-0">
            <div className="aside-user-avatar flex-shrink-0">
              <img
                src="/media/avatars/300-1.jpg"
                alt="User avatar"
                className="w-50px h-50px rounded-3 object-fit-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="text-white fw-bold fs-4 text-truncate">
                {username}
              </div>
              <div className="text-primary-subtle fw-semibold fs-7 text-uppercase mt-1">
                {primaryRole}
              </div>
              <div className="d-flex align-items-center mt-2">
                <span
                  className="d-inline-block rounded-circle me-2"
                  style={{ width: 7, height: 7, backgroundColor: "#00C853" }}
                />
                <span className="text-success fw-medium fs-8">online</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-icon btn-sm aside-user-action"
            aria-label="Account settings"
            title="Account settings"
            onClick={() => navigate("/account/settings")}
          >
            <KTIcon iconName="setting-2" className="fs-3" />
          </button>
        </div>
      </div>

      <button
        type="button"
        className="aside-search-card rounded-4 px-4 py-3 w-100 border-0 text-start"
        onClick={openQuickSearch}
        aria-label="Quick search"
      >
        <div className="d-flex align-items-center gap-3">
          <KTIcon iconName="magnifier" className="fs-2 text-gray-500" />
          <div className="d-flex flex-column">
            <span className="text-gray-500 fw-medium fs-6">Quick Search</span>
            <span className="text-muted fs-8">Menu atau ASN</span>
          </div>
        </div>
      </button>
    </div>
  )
}

export default AsideToolbar
