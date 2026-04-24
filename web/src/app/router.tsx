import React, { lazy } from "react"
import { createBrowserRouter, Navigate, useParams } from "react-router-dom"

import "@/features/services"

import { menuConfig } from "@/app/navigation/menu.config"
import {
  generateMasterRoutes,
  generateRoutes,
} from "./routes/generateRoutes"

import App from "./App"

import LoginPage from "@/features/auth/pages/LoginPage"
import RegisterPage from "@/features/auth/pages/RegisterPage"
import ForbiddenPage from "@/features/_shared/pages/ForbiddenPage"

import { MasterLayout } from "@/_metronic/layout/MasterLayout"
import RouteGuard from "./routes/RouteGuard"

import AccountSettingsPage from "@/features/account/pages/AccountSettingsPage"
import { hasService } from "@/features/services/base/registry"

/* ================= DETAIL PAGE ================= */

const ProfilDetailPage = lazy(
  () => import("@/features/profil-asn/pages/ProfilDetailPage")
)

const WorkforceDetailPage = lazy(
  () =>
    import(
      "@/features/statistics/workforce/pages/WorkforceDetailPage"
    )
)

/* ================= SERVICES ================= */

const ServiceListPage = lazy(
  () => import("@/features/services/base/engine/pages/ServiceListPage")
)

const ServiceCreatePage = lazy(
  () => import("@/features/services/base/engine/pages/ServiceCreatePage")
)

const ServiceDetailPage = lazy(
  () => import("@/features/services/base/engine/pages/ServiceDetailPage")
)

const ServiceVerifyPage = lazy(
  () => import("@/features/services/base/engine/pages/ServiceVerifyPage")
)

/* ================= DASHBOARD ENGINE ================= */

import { getDashboard } from "@/features/services/base/dashboard/dashboard.engine"

function ServiceDashboardRoute() {

  const { service } = useParams<{ service: string }>()

  if (!service || !hasService(service)) {
    return <Navigate to="/dashboard" replace />
  }

  const Dashboard = getDashboard(service)

  return <Dashboard />
}

/* ================= AUTO ROUTES ================= */

const protectedRoutes = generateRoutes(menuConfig)
const masterRoutes = generateMasterRoutes()

/* ======================================================
 * ROUTER
 * ====================================================== */

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [

      {
        path: "/login",
        element: <LoginPage />,
      },

      {
        path: "/register",
        element: <RegisterPage />,
      },

      {
        path: "/",
        element: (
          <RouteGuard>
            <MasterLayout />
          </RouteGuard>
        ),

        children: [

          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },

          {
            path: "/account/settings",
            element: (
              <RouteGuard>
                <AccountSettingsPage />
              </RouteGuard>
            ),
          },

          {
            path: "/asn/:id",
            element: (
              <RouteGuard>
                <ProfilDetailPage />
              </RouteGuard>
            ),
          },

          {
            path: "/asn/profil/:id",
            element: (
              <RouteGuard>
                <ProfilDetailPage />
              </RouteGuard>
            ),
          },

          {
            path: "/statistics/workforce/:unorId",
            element: (
              <RouteGuard>
                <WorkforceDetailPage />
              </RouteGuard>
            ),
          },

          /* ================= SERVICES ================= */

          {
            path: "/layanan/:service",
            element: (
              <RouteGuard>
                <ServiceDashboardRoute />
              </RouteGuard>
            ),
          },

          {
            path: "/layanan/:service/list",
            element: (
              <RouteGuard>
                <ServiceListPage />
              </RouteGuard>
            ),
          },

          {
            path: "/layanan/:service/create",
            element: (
              <RouteGuard>
                <ServiceCreatePage />
              </RouteGuard>
            ),
          },

          {
            path: "/layanan/:service/:id",
            element: (
              <RouteGuard>
                <ServiceDetailPage />
              </RouteGuard>
            ),
          },

          {
            path: "/workflow/verify/:service/:id",
            element: (
              <RouteGuard>
                <ServiceVerifyPage />
              </RouteGuard>
            ),
          },

          /* ================= AUTO MENU ROUTES ================= */

          ...protectedRoutes,
          ...masterRoutes,

          {
            path: "/403",
            element: <ForbiddenPage />,
          },

          {
            path: "*",
            element: <Navigate to="/dashboard" replace />,
          },

        ],
      },
    ],
  },
])
