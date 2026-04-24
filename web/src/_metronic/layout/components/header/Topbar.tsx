import { FC, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { KTIcon, toAbsoluteUrl } from '../../../helpers'
import { HeaderNotificationsMenu, HeaderUserMenu } from '../../../partials'
import { useLayout } from '../../core'
import { MenuComponent } from '../../../assets/ts/components'
import { useAuthStore } from '@/stores/auth.store'

const toolbarButtonMarginClass = 'ms-1 ms-lg-3'
const toolbarButtonHeightClass = 'w-30px h-30px w-md-40px h-md-40px'
const toolbarUserAvatarHeightClass = 'symbol-30px symbol-md-40px'
const toolbarButtonIconSizeClass = 'fs-1'

const Topbar: FC = () => {
  const { config } = useLayout()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const username = useAuthStore((state) => state.user?.username)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setUserMenuOpen(false)
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      MenuComponent.reinitialization?.()
      // @ts-ignore
      window.KTComponents?.init?.()
    })

    const timeoutId = window.setTimeout(() => {
      MenuComponent.reinitialization?.()
      // @ts-ignore
      window.KTComponents?.init?.()
    }, 150)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timeoutId)
    }
  }, [isAuthenticated, username])

  useEffect(() => {
    if (!userMenuOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!userMenuRef.current) {
        return
      }

      if (!userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [userMenuOpen])

  return (
    <div className='d-flex align-items-stretch flex-shrink-0'>

      {/* NOTIFICATIONS */}
      <div className={clsx('d-flex align-items-center', toolbarButtonMarginClass)}>
        <div
          className={clsx(
            'btn btn-icon btn-active-light-primary btn-custom',
            toolbarButtonHeightClass
          )}
          data-kt-menu-trigger='click'
          data-kt-menu-attach='parent'
          data-kt-menu-placement='bottom-end'
        >
          <KTIcon iconName='notification-bing' className={toolbarButtonIconSizeClass} />
        </div>
        <HeaderNotificationsMenu />
      </div>

      {/* USER */}
      <div
        className={clsx('d-flex align-items-center', toolbarButtonMarginClass)}
        id='kt_header_user_menu_toggle'
        data-testid='user-menu-trigger'
        ref={userMenuRef}
        style={{position: 'relative'}}
      >
        <button
          type='button'
          className={clsx('cursor-pointer symbol', toolbarUserAvatarHeightClass)}
          onClick={() => setUserMenuOpen((current) => !current)}
          aria-expanded={userMenuOpen}
          aria-haspopup='menu'
          style={{
            border: 0,
            background: 'transparent',
            padding: 0,
          }}
        >
          <img src={toAbsoluteUrl('media/avatars/300-1.jpg')} alt='user' />
        </button>

        {userMenuOpen ? (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              zIndex: 105,
            }}
          >
            <HeaderUserMenu onClose={() => setUserMenuOpen(false)} />
          </div>
        ) : null}
      </div>

      {/* MOBILE MENU TOGGLER (tetap sesuai template) */}
      {config.header.left === 'menu' && (
        <div className='d-flex align-items-center d-lg-none ms-2 me-n3'>
          <div
            className='btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px'
            id='kt_header_menu_mobile_toggle'
          >
            <KTIcon iconName='text-align-left' className='fs-1' />
          </div>
        </div>
      )}
    </div>
  )
}

export { Topbar }
