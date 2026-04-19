import { FC, useState } from "react"
import { useIsFetching, useIsMutating } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth.store"
import { MenuInner } from "./MenuInner"

const Header: FC = () => {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const isLoading = isFetching > 0 || isMutating > 0

  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const primaryRole =
    user?.roles && user.roles.length > 0
      ? user.roles[0]
      : "USER"

  return (
    <>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "3px",
            width: "100%",
            background: "#0d6efd",
            zIndex: 9999,
          }}
        />
      )}

      <div
        id="kt_header_menu"
        className="header-menu align-items-stretch"
        data-kt-drawer="true"
        data-kt-drawer-name="header-menu"
        data-kt-drawer-activate="{default: true, lg: false}"
        data-kt-drawer-overlay="true"
        data-kt-drawer-width="{default:'200px', '300px': '250px'}"
        data-kt-drawer-direction="end"
        data-kt-drawer-toggle="#kt_header_menu_mobile_toggle"
        data-kt-swapper="true"
        data-kt-swapper-mode="prepend"
        data-kt-swapper-parent="{default: '#kt_body', lg: '#kt_header_nav'}"
      >
        <div
          className="menu menu-lg-rounded menu-column menu-lg-row fw-bold align-items-stretch"
          data-kt-menu="true"
        >
          <MenuInner />
        </div>

        <div className="d-flex align-items-center ms-auto pe-5 position-relative">
          <button
            type="button"
            data-testid="user-menu-trigger"
            className="btn btn-light d-flex align-items-center gap-3"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <div className="text-end">
              <div className="fw-bold text-gray-800">
                {user?.username ?? "Guest"}
              </div>

              <div className="fs-7 text-muted">
                {primaryRole}
                {user?.opd && (
                  <>
                    {" "}
                    • {user.opd}
                  </>
                )}
              </div>
            </div>
          </button>

          {menuOpen && (
            <div
              className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-225px show"
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                zIndex: 1000,
              }}
              role="menu"
            >
              <div className="menu-item px-5">
                <button
                  type="button"
                  data-testid="logout-action"
                  className="menu-link px-5 btn btn-light-danger w-100"
                  onClick={async () => {
                    setMenuOpen(false)
                    await logout()
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export { Header }
