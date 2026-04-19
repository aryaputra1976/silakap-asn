import {useAuthStore} from '@/stores/auth.store'
import {KTIcon, toAbsoluteUrl} from '../../../helpers'
import {HeaderUserMenu, Search} from '../../../partials'

const AsideToolbar = () => {
  const user = useAuthStore((s) => s.user)

  const currentUser = user
    ? {
        first_name: user.username,
        last_name: '',
      }
    : null

  return (
    <>
      <div className='aside-user d-flex align-items-sm-center justify-content-center py-5'>
        <div className='symbol symbol-50px'>
          <img src={toAbsoluteUrl('media/avatars/300-1.jpg')} alt='' />
        </div>

        <div className='aside-user-info flex-row-fluid flex-wrap ms-5'>
          <div className='d-flex'>
            <div className='flex-grow-1 me-2'>
              <a href='#' className='text-white text-hover-primary fs-6 fw-bold'>
                {currentUser?.first_name} {currentUser?.last_name}
              </a>

              <span className='text-gray-600 fw-bold d-block fs-8 mb-1'>
                {user?.roles?.[0] ?? 'User'}
              </span>

              <div className='d-flex align-items-center text-success fs-9'>
                <span className='bullet bullet-dot bg-success me-1'></span>online
              </div>
            </div>

            <div className='me-n2'>
              <a
                href='#'
                className='btn btn-icon btn-sm btn-active-color-primary mt-n2'
                data-kt-menu-trigger='click'
                data-kt-menu-placement='bottom-start'
                data-kt-menu-overflow='false'
              >
                <KTIcon iconName='setting-2' className='text-muted fs-1' />
              </a>

              <HeaderUserMenu />
            </div>
          </div>
        </div>
      </div>

      <div className='aside-search py-5'>
        <Search />
      </div>
    </>
  )
}

export {AsideToolbar}