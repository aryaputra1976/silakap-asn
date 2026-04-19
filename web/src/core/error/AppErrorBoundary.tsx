import React, { Component, ReactNode } from "react"
import { ErrorFallback } from "./ErrorFallback"

export type AppErrorReport = {
  error: Error
  componentStack?: string
  timestamp: string
  url: string
  userAgent: string
}

export type AppErrorReporter = (
  report: AppErrorReport,
) => void | Promise<void>

let appErrorReporter: AppErrorReporter = (report) => {
  console.error("GLOBAL UI ERROR:", report.error, report)
}

export function setAppErrorReporter(reporter: AppErrorReporter) {
  appErrorReporter = reporter
}

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
  error?: Error
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const report: AppErrorReport = {
      error,
      componentStack: info.componentStack ?? undefined,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: window.navigator.userAgent,
    }

    void Promise.resolve(appErrorReporter(report)).catch(
      (reportingError) => {
        console.error(
          "APP ERROR REPORT FAILED:",
          reportingError,
        )
      },
    )
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}
