type Subscriber = (token: string) => void
type ErrorSubscriber = (error: unknown) => void

type RefreshSubscriber = {
  onSuccess: Subscriber
  onError: ErrorSubscriber
}

let isRefreshing = false
let subscribers: RefreshSubscriber[] = []

export function subscribeTokenRefresh(
  onSuccess: Subscriber,
  onError: ErrorSubscriber,
) {
  subscribers.push({ onSuccess, onError })
}

export function onRefreshed(token: string) {
  subscribers.forEach((subscriber) =>
    subscriber.onSuccess(token),
  )
  subscribers = []
}

export function onRefreshFailed(error: unknown) {
  subscribers.forEach((subscriber) =>
    subscriber.onError(error),
  )
  subscribers = []
}

export function setRefreshing(value: boolean) {
  isRefreshing = value
}

export function getRefreshing() {
  return isRefreshing
}
