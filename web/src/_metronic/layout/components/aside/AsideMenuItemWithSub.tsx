import React, {useEffect, useState} from 'react'
import clsx from 'clsx'
import {KTIcon, WithChildren} from '../../../helpers'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean
  isActive?: boolean
}

const AsideMenuItemWithSub: React.FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  hasBullet,
  isActive = false,
}) => {
  const [isOpen, setIsOpen] = useState(isActive)

  useEffect(() => {
    setIsOpen(isActive)
  }, [isActive])

  return (
    <div
      className={clsx('menu-item menu-accordion', { 'here show': isOpen })}
    >
      <button
        type='button'
        className='menu-link w-100 border-0 bg-transparent text-start'
        onClick={() => setIsOpen((prev) => !prev)}
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
        <span className='menu-title'>{title}</span>
        <span className='menu-arrow'></span>
      </button>
      <div
        className={clsx('menu-sub menu-sub-accordion', {
          'menu-active-bg': isOpen,
          show: isOpen,
        })}
      >
        {children}
      </div>
    </div>
  )
}

export {AsideMenuItemWithSub}
