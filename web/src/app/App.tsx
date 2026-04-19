import { Suspense } from "react"
import { Outlet } from "react-router-dom"

import { LoadingScreen } from "@/components/common/LoadingScreen"
import { AuthProvider } from "./providers/AuthProvider"
import { AppProvider } from "./providers/AppProvider"
import NavigationSearch from "@/components/navigation/NavigationSearch"

/**
 * Root App Shell
 * Tidak pegang router.
 * Hanya provider global + suspense boundary.
 */
export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
          <Suspense fallback={<LoadingScreen />}>
            <NavigationSearch />
            <Outlet />
          </Suspense>
      </AuthProvider>
    </AppProvider>
  )
}