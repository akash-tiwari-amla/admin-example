// react/typings/vtex.session-client.d.ts
declare module 'vtex.session-client' {
  export const useFullSession: () => {
    loading: boolean
    session: {
      sessionId: string
      namespaces: Record<string, any>
    } | null
  }
}
