'use client'

import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

/**
 * Returns `true` once the component has mounted on the client.
 * Use this to guard rendering that depends on client-only values
 * (dates, window size, localStorage, etc.) so the server and
 * first client render produce identical markup — avoiding React
 * hydration mismatches.
 *
 * Uses `useSyncExternalStore` to avoid the lint warning about
 * calling setState inside an effect.
 */
export const useMounted = (): boolean => {
  return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot)
}
