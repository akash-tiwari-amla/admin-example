import React, { useEffect, useState } from 'react'
import { useProduct } from 'vtex.product-context'

interface MyVariation {
  name: string
  values: string[]
}

interface MyAttachment {
  id: string
  name: string
  required: boolean
  __typename: string
}

interface MySelectedItem {
  itemId: string
  name?: string
  referenceId?: Array<{ Value: string }>
  variations?: MyVariation[]
  attachments?: MyAttachment[]
}

interface MyProduct {
  properties?: Array<{ name: string; values: string[] }>
}

interface MyProductContext {
  product?: MyProduct | null
  selectedItem?: MySelectedItem | null
}

interface ArtifiConfig {
  webApiClientKey: string
  websiteId: string
  integrationURL: string
}

interface ArtifiLoaderProps {
  userId?: string
}

const GET_API_URL =
  'https://integrationdevapi.artifi.net/api/3/Vtex/GetVtexConfigurationDetails'

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

const GUEST_COOKIE_NAME = 'artifi_guest_id'
const COOKIE_MAX_AGE_DAYS = 365

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
  )
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ---------------------------------------------------------------------------
// Get or create a persistent guest ID from a cookie
// ---------------------------------------------------------------------------
function getOrCreateGuestId(): string {
  let guestId = getCookie(GUEST_COOKIE_NAME)
  if (!guestId) {
    guestId = `guest-${generateUUID()}`
    setCookie(GUEST_COOKIE_NAME, guestId, COOKIE_MAX_AGE_DAYS)
  }
  return guestId
}

// ---------------------------------------------------------------------------
// Fetch the logged-in user's profile ID via VTEX session
// Returns null when the user is a guest / not logged in
// ---------------------------------------------------------------------------
async function fetchLoggedInUserId(): Promise<string | null> {
  try {
    const res = await fetch('/api/sessions?items=profile.id,profile.email', {
      credentials: 'include',
    })
    if (!res.ok) return null
    const data = await res.json()
    const profileId: string | undefined = data?.namespaces?.profile?.id?.value
    // VTEX returns an empty string or undefined for unauthenticated users
    return profileId || null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Migration API
// ---------------------------------------------------------------------------
const getBaseUrl = (fullUrl: string): string => {
  try {
    const urlObj = new URL(fullUrl)
    urlObj.hostname = urlObj.hostname.replace('component', 'api')
    return `${urlObj.protocol}//${urlObj.host}`
  } catch {
    return fullUrl.replace('component', 'api')
  }
}

async function migrateGuestToUser(
  guestId: string,
  loggedInUserId: string,
  config: ArtifiConfig
): Promise<boolean> {
  console.log(
    `[Artifi] Migrating guest "${guestId}" → user "${loggedInUserId}"`
  )
  try {
    const queryString = `newUserId=${loggedInUserId}&oldUserId=${guestId}&websiteId=${config.websiteId}&webApiClientKey=${config.webApiClientKey}&isGuest=false`
    const baseUrl = getBaseUrl(config.integrationURL)
    
    const response = await fetch(`${baseUrl}/api/3/User/UpdateUserId?${queryString}`, {
      method: 'PUT',
    })
    
    return response.ok
  } catch (err) {
    console.error('Artifi migration error:', err)
    return false
  }
}

// ---------------------------------------------------------------------------
// Dynamically extract the account ID from the hostname
// ---------------------------------------------------------------------------
const getAccountId = (): string => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  if (hostname.includes('.myvtex.com')) {
    return hostname.split('.myvtex.com')[0]
  }
  return 'sandboxhimanshu11' // Fallback
}

// ===========================================================================
// Component
// ===========================================================================
const InitializeArtifi: React.FC<ArtifiLoaderProps> = () => {
  const productContext = useProduct() as MyProductContext
  console.log('Product context in InitializeArtifi:', productContext)
  const { selectedItem } = productContext
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [config, setConfig] = useState<ArtifiConfig | null>(null)
  // null  = not yet resolved, string = resolved user/guest id
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null)
  const [isGuest, setIsGuest] = useState(true)

  const sku = selectedItem?.referenceId?.[0]?.Value

  const hasArtifiAttachment = selectedItem?.attachments?.some(
    (attachment) => attachment.name === 'Artifi Customization'
  )

  // Step 0: Resolve the userId (guest cookie OR logged-in profile ID)
  useEffect(() => {
    const resolveUser = async () => {
      const loggedInUserId = await fetchLoggedInUserId()
      if (loggedInUserId) {
        // User is logged in
        setResolvedUserId(loggedInUserId)
        setIsGuest(false)
      } else {
        // User is a guest — get or create a stable random ID in cookie
        const guestId = getOrCreateGuestId()
        setResolvedUserId(guestId)
        setIsGuest(true)
      }
    }

    resolveUser()
  }, [])

  // Step 0.5: Migrate Guest designs to Logged-in User once both config and user are resolved
  useEffect(() => {
    if (!config || !resolvedUserId || isGuest) return

    const guestId = getCookie(GUEST_COOKIE_NAME)
    if (guestId && guestId !== resolvedUserId) {
      migrateGuestToUser(guestId, resolvedUserId, config).then((success) => {
        if (success) {
          // Once migrated, overwrite the cookie so repeat visits use the real ID
          setCookie(GUEST_COOKIE_NAME, resolvedUserId, COOKIE_MAX_AGE_DAYS)
        }
      })
    }
  }, [config, resolvedUserId, isGuest])

  // Step 1: Fetch Artifi config from the API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const accountId = getAccountId()
        const response = await fetch(`${GET_API_URL}?storeHash=${accountId}`, {
          headers: {
            accept: 'text/plain; x-api-version=3.0',
          },
        })
        if (!response.ok) throw new Error('Failed to fetch config')
        const data = await response.json()
        const d = data.Data ?? {}
        if (d.WebApiClientKey && d.WebsiteId && d.IntegrationURL) {
          setConfig({
            webApiClientKey: d.WebApiClientKey,
            websiteId: String(d.WebsiteId),
            integrationURL: d.IntegrationURL,
          })
        }
      } catch (err) {
        console.error('Error fetching Artifi configuration:', err)
      }
    }

    fetchConfig()
  }, [])

  // Step 2: Load the Artifi script using the IntegrationURL from config
  useEffect(() => {
    if (!config) return
    const scriptUrl = config.integrationURL
    if (document.querySelector(`script[src="${scriptUrl}"]`)) {
      setScriptLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = scriptUrl
    script.async = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => console.error('Failed to load Artifi script')
    document.body.appendChild(script)
  }, [config])

  // Step 3: Initialize Artifi once script, SKU, config and userId are all ready
  useEffect(() => {
    if (
      !scriptLoaded ||
      !sku ||
      !window.Artifi ||
      !config ||
      !hasArtifiAttachment ||
      !resolvedUserId
    )
      return

    window.Artifi.initialize({
      webApiClientKey: config.webApiClientKey,
      websiteId: config.websiteId,
      userId: resolvedUserId,
      designId: 0,
      isGuest: isGuest ? 'true' : 'false',
      sku,
      extraDetails: '',
      decorationMethod: '',
      refDesignId: 0,
    })
  }, [scriptLoaded, sku, config, resolvedUserId, isGuest])

  return null
}

export default InitializeArtifi
