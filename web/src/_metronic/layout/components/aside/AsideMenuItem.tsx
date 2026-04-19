import { FC, useCallback } from 'react'
import clsx from 'clsx'
import { Link, useLocation } from 'react-router-dom'
import { checkIsActive, KTIcon, WithChildren } from '../../../helpers'
import { useQueryClient } from '@tanstack/react-query'
import httpClient from '@/core/http/httpClient'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean
  badge?: number
}

const AsideMenuItem: FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  hasBullet = false,
  badge,
}) => {
  const { pathname } = useLocation()
  //const isActive = checkIsActive(pathname, to)
  const isActive = pathname === to
  const queryClient = useQueryClient()

  // 🔥 PREFETCH HANDLER
  const handlePrefetch = useCallback(() => {
    // hanya prefetch route tertentu
    if (to === '/workflow/antrian') {
      queryClient.prefetchQuery({
        queryKey: ['layananQueue', { jenis: undefined, page: 1 }],
        queryFn: async ({ signal }) => {
          const res = await httpClient.get('/layanan/queue', {
            signal,
            params: {
              page: 1,
              limit: 10,
            },
          })
          return res.data
        },
        staleTime: 1000 * 30,
      })
    }
  }, [to, queryClient])

  return (
    <div className='menu-item'>
      <Link
        to={to}
        onMouseEnter={handlePrefetch}
        className={clsx('menu-link without-sub', { active: isActive })}
      >
        {hasBullet && (
          <span className='menu-bullet'>
            <span className='bullet bullet-dot'></span>
          </span>
        )}

        {icon && (
          <span className='menu-icon'>
            <KTIcon iconName={icon} className='fs-2' />
          </span>
        )}

        {fontIcon && <i className={clsx('bi fs-3', fontIcon)}></i>}

        <span className='menu-title d-flex align-items-center'>
          {title}

          {badge !== undefined && badge > 0 && (
            <span className='badge badge-light-danger ms-2'>
              {badge}
            </span>
          )}
        </span>
      </Link>

      {children}
    </div>
  )
}

export { AsideMenuItem }