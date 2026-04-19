import { menuConfig, MenuItemConfig } from "@/app/navigation/menu.config"
import { useFilteredMenu } from "@/app/navigation/menu.filter"
import { useLayananBadge } from "@/features/_shared/hooks/useLayananBadge"

import { AsideMenuItem } from "./AsideMenuItem"
import { AsideMenuItemWithSub } from "./AsideMenuItemWithSub"

export function AsideMenuMain() {

  const filteredMenu = useFilteredMenu()

  const { count } = useLayananBadge()

  function renderMenu(items: MenuItemConfig[], level = 0): React.ReactNode {

    return items.map((item) => {

      const hasChildren = item.children && item.children.length > 0

      if (hasChildren) {

        return (
          <AsideMenuItemWithSub
            key={item.path ?? item.title}
            to={item.path ?? "#"}
            title={item.title}
            icon={level === 0 ? item.icon : undefined}
          >
            {renderMenu(item.children!, level + 1)}
          </AsideMenuItemWithSub>
        )
      }

      return (
        <AsideMenuItem
          key={item.path ?? item.title}
          to={item.path ?? "#"}
          title={item.title}
          icon={level === 0 ? item.icon : undefined}
          hasBullet={level > 0}
          badge={item.path === "/workflow/antrian" ? count : undefined}
        />
      )
    })

  }

  return <>{renderMenu(filteredMenu)}</>
}