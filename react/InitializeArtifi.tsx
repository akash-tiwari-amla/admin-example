import React, { useEffect, useState } from 'react'
import { useProduct } from 'vtex.product-context'
// Define what parts you expect from the product context
interface MySelectedItem {
  itemId: string
  name?: string
  referenceId?: Array<{ Value: string }>
}

interface MyProductContext {
  selectedItem?: MySelectedItem | null
  // You can add more fields if needed (product, etc.)
}

interface ArtifiLoaderProps {
  artifiURL?: string
  webApiClientKey: string
  websiteId: string
  userId?: string
}

const InitializeArtifi: React.FC<ArtifiLoaderProps> = ({
  artifiURL = 'https://stagecomponent.artifi.net/artifi-headless-releases/3.0/Artifi.headless.js',
  webApiClientKey = 'd94f671d-10f0-4e8b-bef2-2c70945d52e2',
  websiteId = 170,
  userId = 'guest-user-id',
}) => {
  // Cast useProduct result to your custom interface
  const productContext = useProduct() as MyProductContext
  const { selectedItem } = productContext
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Use the identifier SKU from referenceId if it exists
  const sku = selectedItem?.referenceId?.[0]?.Value

  useEffect(() => {
    if (document.querySelector(`script[src="${artifiURL}"]`)) {
      setScriptLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = artifiURL
    script.async = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => console.error('Failed to load Artifi script')
    document.body.appendChild(script)
  }, [artifiURL])

  useEffect(() => {
    if (!scriptLoaded || !sku || !window.Artifi) return

    window.Artifi.initialize({
      webApiClientKey,
      websiteId,
      userId,
      designId: 0,
      isGuest: userId === 'guest-user-id' ? 'true' : 'false',
      sku,
      extraDetails: '',
      decorationMethod: '',
      refDesignId: 0,
    })
  }, [scriptLoaded, sku, userId, webApiClientKey, websiteId])

  return null
}

export default InitializeArtifi
