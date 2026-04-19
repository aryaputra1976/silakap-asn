import React, { useEffect } from 'react'
import clsx from 'clsx'

type ModalSize = 'sm' | 'lg' | 'xl' | 'fullscreen' | undefined

interface BaseModalProps {
  open: boolean
  title?: string
  children: React.ReactNode
  onClose: () => void
  size?: ModalSize
  footer?: React.ReactNode
  loading?: boolean
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  destroyOnClose?: boolean
}

export const BaseModal: React.FC<BaseModalProps> = ({
  open,
  title,
  children,
  onClose,
  size,
  footer,
  loading = false,
  closeOnBackdrop = true,
  closeOnEsc = true,
  destroyOnClose = false,
}) => {
  // ESC close
  useEffect(() => {
    if (!closeOnEsc) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose, closeOnEsc])

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }

    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [open])

  if (!open && destroyOnClose) return null

  return (
    <>
      {/* Modal */}
      <div
        className={clsx(
          'modal fade',
          open && 'show d-block'
        )}
        tabIndex={-1}
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={() => {
          if (closeOnBackdrop) onClose()
        }}
      >
        <div
          className={clsx(
            'modal-dialog',
            size && `modal-${size}`
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              />
            </div>

            {/* Body */}
            <div className="modal-body position-relative">
              {loading && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75 z-index-1">
                  <div className="spinner-border text-primary" />
                </div>
              )}
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="modal-footer">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {open && <div className="modal-backdrop fade show"></div>}
    </>
  )
}