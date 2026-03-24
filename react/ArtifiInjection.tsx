import React from 'react'
import { useProduct } from 'vtex.product-context'

interface MyAttachment {
  id: string
  name: string
  required: boolean
  __typename: string
}

interface MySelectedItem {
  itemId: string
  attachments?: MyAttachment[]
}

interface MyProductContext {
  selectedItem?: MySelectedItem | null
}

interface IArtifiFeature {
  feature?: string[]
}

const ArtifiInjection = ({ feature = [] }: IArtifiFeature) => {
  const productContext = useProduct() as MyProductContext
  const { selectedItem } = productContext

  // Check if product has Artifi Customization attachment
  const hasArtifiAttachment = selectedItem?.attachments?.some(
    (attachment) => attachment.name === 'Artifi Customization'
  )
 console.log('Selected item attachments: ', selectedItem?.attachments)
  console.log('Has Artifi Attachment: ', hasArtifiAttachment)
  // Don't render if no Artifi attachment
  if (!hasArtifiAttachment) {
    return null
  }

  const renderFeature = (featureName: string) => {
    switch (featureName) {
      case 'upload':
        return (
          <div key="upload">
            <div
              id="artifi-upload-user-image"
              data-selector="artifi-upload-user-image"
              data-image-id="image_1"
              className="mt-2 mb-2"
            />
          </div>
        )
      case 'text-area':
        return (
          <div key="text-area">
            <div id="artifi-text-area" data-text-id="text_1" />
          </div>
        )
      case 'text-formatting':
        return (
          <div key="text-formatting" className="flex gap-2 mt-2">
            <div id="artifi-text-bold" data-text-id="text_1" />
            <div id="artifi-text-italic" data-text-id="text_1" />
            <div id="artifi-horizontal-alignment" data-text-id="text_1" />
          </div>
        )
      case 'text-color':
        return (
          <div key="text-color">
            <div id="artifi-text-color" data-text-id="text_1" data-page-size="50" />
          </div>
        )
      case 'myArt':
        return (
          <div id="artifi-user-images" data-image-id="image_1" data-view-code="" data-add-widget="" style={{marginTop:"5px"}}></div>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <style>{`
        .vtex-store-components-3-x-productImage {
          display: none !important;
        }
        button:has(.vtex-add-to-cart-button-0-x-buttonDataContainer) {
          display: none !important;
        }
        .add-to-cart-button {
          display: none !important;
        }
      `}</style>
      {feature.map((featureName) => renderFeature(featureName))}
    </div>
  )
}

export default ArtifiInjection
