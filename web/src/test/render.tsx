import { PropsWithChildren, ReactElement } from "react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, type RenderOptions } from "@testing-library/react"
import { ConfirmProvider } from "@/components/common/confirm/ConfirmProvider"

type ExtendedRenderOptions = Omit<RenderOptions, "wrapper"> & {
  route?: string
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

function TestProviders({
  children,
  route = "/",
}: PropsWithChildren<{ route?: string }>) {
  const queryClient = createTestQueryClient()

  return (
    <MemoryRouter initialEntries={[route]}>
      <ConfirmProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ConfirmProvider>
    </MemoryRouter>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  options: ExtendedRenderOptions = {},
) {
  const { route, ...renderOptions } = options

  return render(ui, {
    wrapper: ({ children }: PropsWithChildren) => (
      <TestProviders route={route}>{children}</TestProviders>
    ),
    ...renderOptions,
  })
}

export * from "@testing-library/react"
