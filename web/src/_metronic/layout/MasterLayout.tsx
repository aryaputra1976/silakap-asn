import {useEffect} from 'react'
import {Outlet, useLocation} from 'react-router-dom'
import {MasterInit} from './MasterInit'
import {AsideDefault} from './components/aside/AsideDefault'
import {Footer} from './components/Footer'
import {HeaderWrapper} from './components/header/HeaderWrapper'
//import {RightToolbar} from '../partials/layout/RightToolbar'
import {ScrollTop} from './components/ScrollTop'
import {Content} from './components/Content'
import {PageDataProvider} from './core'
import {ActivityDrawer, DrawerMessenger, InviteUsers, UpgradePlan} from '../partials'
import {
    DrawerComponent,
    MenuComponent,
    ScrollComponent,
    ScrollTopComponent,
    SwapperComponent,
    ToggleComponent
} from '../assets/ts/components'

const MasterLayout = () => {
  const location = useLocation()
/*
  useEffect(() => {
    const timer = setTimeout(() => {
      MenuComponent.reinitialization()
      DrawerComponent.reinitialization()
      ToggleComponent.reinitialization()
      ScrollComponent.reinitialization()
      ScrollTopComponent.reinitialization()
      SwapperComponent.reinitialization()
    }, 100)

    return () => clearTimeout(timer)
  }, [location.pathname])
*/
useEffect(() => {
  // tunggu React render selesai
  const t1 = setTimeout(() => {
    // reinit menu
    MenuComponent.reinitialization?.()

    // reinit seluruh komponen Metronic (PENTING untuk toolbar)
    // @ts-ignore
    window.KTComponents?.init()
  }, 50)

  // re-run sekali lagi untuk kasus redirect login
  const t2 = setTimeout(() => {
    MenuComponent.reinitialization?.()
    // @ts-ignore
    window.KTComponents?.init()
  }, 300)

  return () => {
    clearTimeout(t1)
    clearTimeout(t2)
  }
}, [location.pathname])

useEffect(() => {
  // 🔥 paksa bersihkan overlay & body class Metronic
  document.body.classList.remove(
    'drawer-overlay',
    'drawer-on',
    'modal-open'
  )

  // hapus backdrop manual kalau ada
  document.querySelectorAll('.drawer-overlay, .modal-backdrop')
    .forEach(el => el.remove())
}, [location.pathname])

  return (
    <PageDataProvider>
      <div className='page d-flex flex-row flex-column-fluid'>
        <AsideDefault />
        <div className='wrapper d-flex flex-column flex-row-fluid' id='kt_wrapper'>
          <HeaderWrapper />

          <div id='kt_content' className='content d-flex flex-column flex-column-fluid'>
            <div className='post d-flex flex-column-fluid' id='kt_post'>
              <Content>
                <Outlet />
              </Content>
            </div>
          </div>
          <Footer />
        </div>
      </div>

      {/* begin:: Drawers */}
      <ActivityDrawer />
      
      <DrawerMessenger />
      {/* end:: Drawers */}

      {/* begin:: Modals */}
      <InviteUsers />
      <UpgradePlan />
      {/* end:: Modals */}
      <ScrollTop />
      <MasterInit />
    </PageDataProvider>
  )
}

export {MasterLayout}
