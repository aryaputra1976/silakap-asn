import {FC} from 'react'
import {Link} from 'react-router-dom'
import {useAuthStore} from '@/stores/auth.store'
import {toAbsoluteUrl} from '../../../helpers'

type Props = {
  onClose?: () => void
}

const HeaderUserMenu: FC<Props> = ({onClose}) => {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div
      className='menu menu-sub menu-sub-dropdown show menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px'
      role='menu'
    >
      <div className='menu-item px-3'>
        <div className='menu-content d-flex align-items-center px-3'>
          <div className='symbol symbol-50px me-5'>
            <img alt='Logo' src={toAbsoluteUrl('media/avatars/300-1.jpg')} />
          </div>

          <div className='d-flex flex-column'>
            <div className='fw-bolder d-flex align-items-center fs-5'>
              {user?.username}
            </div>
            <div className='fw-bold text-muted fs-7'>
              {user?.roles?.join(', ')}
            </div>
          </div>
        </div>
      </div>

      <div className='separator my-2'></div>

      <div className='menu-item px-5 my-1'>
        <Link
          to='/account/settings'
          className='menu-link px-5'
          onClick={onClose}
        >
          Account Settings
        </Link>
      </div>

      <div className='menu-item px-5'>
        <button
          type='button'
          data-testid='logout-action'
          onClick={() => {
            onClose?.()
            void logout()
          }}
          className='menu-link px-5 btn btn-link w-100 text-start'
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

export {HeaderUserMenu}
