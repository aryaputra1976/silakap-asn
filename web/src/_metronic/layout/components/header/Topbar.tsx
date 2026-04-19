import { FC } from 'react'
import clsx from 'clsx'
import { KTIcon, toAbsoluteUrl } from '../../../helpers'
import { HeaderNotificationsMenu, HeaderUserMenu } from '../../../partials'
import { useLayout } from '../../core'

const toolbarButtonMarginClass = 'ms-1 ms-lg-3'
const toolbarButtonHeightClass = 'w-30px h-30px w-md-40px h-md-40px'
const toolbarUserAvatarHeightClass = 'symbol-30px symbol-md-40px'
const toolbarButtonIconSizeClass = 'fs-1'

const Topbar: FC = () => {
  const { config } = useLayout()

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
      >
        <div
          className={clsx('cursor-pointer symbol', toolbarUserAvatarHeightClass)}
          data-kt-menu-trigger='click'
          data-kt-menu-attach='parent'
          data-kt-menu-placement='bottom-end'
        >
          <img src={toAbsoluteUrl('media/avatars/300-1.jpg')} alt='user' />
        </div>
        <HeaderUserMenu />
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
