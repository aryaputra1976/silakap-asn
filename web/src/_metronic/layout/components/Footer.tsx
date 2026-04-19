import { FC } from 'react'
import { useLayout } from '../core'

const Footer: FC = () => {
  const { classes } = useLayout()

  return (
    <div className='footer py-4 d-flex flex-lg-column' id='kt_footer'>
      <div
        className={`${classes.footerContainer} d-flex flex-column flex-md-row align-items-center justify-content-between`}
      >
        {/* LEFT SIDE */}
        <div className='text-gray-600 order-2 order-md-1'>
          <span className='fw-semibold'>
            © {new Date().getFullYear()} SILAKAP
          </span>
          <span className='mx-2'>|</span>
          <span className='text-muted'>
            Sistem Informasi Layanan Kepegawaian
          </span>
        </div>

        {/* RIGHT SIDE */}
        <div className='text-gray-500 fs-7 order-1 order-md-2'>
          BKPSDM Kabupaten Tolitoli
          <span className='mx-2'>|</span>
          Versi 1.0.0
        </div>
      </div>
    </div>
  )
}

export { Footer }