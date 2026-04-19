import { getRequest, postRequest } from "@/core/http"

export type ServiceMutationPayload = Record<string, unknown>

export async function getServiceList<TResponse>(
  service: string,
): Promise<TResponse> {
  return getRequest<TResponse>(`/services/${service}`)
}

export async function getServiceDetail<TResponse>(
  service: string,
  id: string,
): Promise<TResponse> {
  return getRequest<TResponse>(`/services/${service}/${id}`)
}

export async function createService<
  TResponse,
  TPayload extends ServiceMutationPayload,
>(
  service: string,
  payload: TPayload,
): Promise<TResponse> {
  return postRequest<TResponse, TPayload>(
    `/services/${service}`,
    payload,
  )
}

export async function submitService<TResponse>(
  service: string,
  id: string,
): Promise<TResponse> {
  return postRequest<TResponse, { usulId: string }>(
    `/services/${service}/submit`,
    { usulId: id },
  )
}

export async function dispatchWorkflowAction<TResponse>(
  service: string,
  id: string,
  action: string,
): Promise<TResponse> {
  return postRequest<
    TResponse,
    { usulId: string; actionCode: string }
  >(
    `/services/${service}/workflow`,
    {
      usulId: id,
      actionCode: action.toUpperCase(),
    },
  )
}
