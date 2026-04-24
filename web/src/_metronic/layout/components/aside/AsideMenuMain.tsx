// web/src/_metronic/layout/components/aside/AsideMenuMain.tsx

import React, { Fragment, useMemo } from "react"
import { Link, useLocation } from "react-router-dom"
import { APP_MENU, type AppMenuItem } from "@/app/navigation/menu.config"
import { filterMenuByAccess } from "@/app/navigation/menu.filter"
import { KTIcon } from "../../../helpers"

type AsideMenuMainProps = {
  roles?: string[]
  permissions?: string[]
  badgeCounts?: Record<string, number>
}

function isMenuItemActive(pathname: string, itemPath?: string): boolean {
  if (!itemPath) {
    return false
  }

  if (pathname === itemPath) {
    return true
  }

  return pathname.startsWith(`${itemPath}/`)
}

function hasActiveChild(pathname: string, children?: AppMenuItem[]): boolean {
  if (!children || children.length === 0) {
    return false
  }

  return children.some((child) => {
    if (isMenuItemActive(pathname, child.path)) {
      return true
    }

    return hasActiveChild(pathname, child.children)
  })
}

function getBadgeValue(
  badgeKey: string | undefined,
  badgeCounts?: Record<string, number>
): number | null {
  if (!badgeKey || !badgeCounts) {
    return null
  }

  const value = badgeCounts[badgeKey]

  if (typeof value !== "number" || value <= 0) {
    return null
  }

  return value
}

function renderIcon(icon?: string): React.ReactNode {
  if (!icon) {
    return null
  }

  return (
    <span className="menu-icon">
      <KTIcon iconName={icon} className="fs-2" />
    </span>
  )
}

function AsideMenuNode({
  item,
  pathname,
  badgeCounts,
  level = 0
}: {
  item: AppMenuItem
  pathname: string
  badgeCounts?: Record<string, number>
  level?: number
}): React.ReactElement | null {
  const hasChildren = Boolean(item.children && item.children.length > 0)
  const active = isMenuItemActive(pathname, item.path)
  const childActive = hasActiveChild(pathname, item.children)
  const open = active || childActive
  const badgeValue = getBadgeValue(item.badgeKey, badgeCounts)

  if (!item.path && !hasChildren) {
    return null
  }

  if (hasChildren) {
    return (
      <div
        className={[
          "menu-item",
          level === 0 ? "menu-item-root" : "menu-item-child",
          "menu-accordion",
          open ? "here show" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        data-kt-menu-trigger="click"
        data-kt-menu-placement="bottom-start"
      >
        <span
          className={[
            "menu-link",
            level === 0 ? "menu-link-root" : "menu-link-child",
            open ? "active" : ""
          ].join(" ")}
        >
          <span className="d-flex align-items-center flex-grow-1 min-w-0">
            {level === 0 ? renderIcon(item.icon) : null}
            <span className="menu-title">{item.title}</span>
          </span>

          <span className="d-flex align-items-center ms-2">
            {badgeValue !== null ? (
              <span className="menu-badge me-2">
                <span className="badge badge-light-danger fw-bold min-w-25px">
                  {badgeValue}
                </span>
              </span>
            ) : null}

            <span className={["menu-chevron", open ? "open" : ""].join(" ")}>
              <KTIcon iconName="right" className="fs-4" />
            </span>
          </span>
        </span>

        <div className={["menu-sub", "menu-sub-accordion", open ? "show" : ""].join(" ")}>
          {item.children!.map((child) => (
            <Fragment key={child.key}>
              <AsideMenuNode
                item={child}
                pathname={pathname}
                badgeCounts={badgeCounts}
                level={level + 1}
              />
            </Fragment>
          ))}
        </div>
      </div>
    )
  }

  if (level > 0) {
    return (
      <div className="menu-item menu-item-child" data-menu-level={level}>
        <Link
          to={item.path!}
          className={["menu-link", "menu-link-child", active ? "active" : ""].join(" ")}
        >
          <span className="menu-bullet">
            <span className="bullet bullet-dot" />
          </span>

          <span className="menu-title">{item.title}</span>

          {badgeValue !== null ? (
            <span className="menu-badge ms-2">
              <span className="badge badge-light-danger fw-bold min-w-25px">
                {badgeValue}
              </span>
            </span>
          ) : null}
        </Link>
      </div>
    )
  }

  return (
    <div className="menu-item menu-item-root" data-menu-level={level}>
      <Link
        to={item.path!}
        className={["menu-link", "menu-link-root", active ? "active" : ""].join(" ")}
      >
        <span className="d-flex align-items-center flex-grow-1 min-w-0">
          {renderIcon(item.icon)}
          <span className="menu-title">{item.title}</span>
        </span>

        {badgeValue !== null ? (
          <span className="menu-badge ms-2">
            <span className="badge badge-light-danger fw-bold min-w-25px">
              {badgeValue}
            </span>
          </span>
        ) : null}
      </Link>
    </div>
  )
}

export function AsideMenuMain({
  roles = [],
  permissions = [],
  badgeCounts
}: AsideMenuMainProps): React.ReactElement {
  const { pathname } = useLocation()

  const filteredMenu = useMemo(() => {
    return filterMenuByAccess(APP_MENU, {
      roles,
      permissions
    })
  }, [roles, permissions])

  return (
    <div className="menu menu-column menu-rounded fw-semibold fs-6" data-kt-menu="true">
      {filteredMenu.map((item) => (
        <Fragment key={item.key}>
          <AsideMenuNode item={item} pathname={pathname} badgeCounts={badgeCounts} />
        </Fragment>
      ))}
    </div>
  )
}

export default AsideMenuMain
