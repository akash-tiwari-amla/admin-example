import React, { useEffect } from 'react'
import { useOrderForm } from 'vtex.order-manager/OrderForm'

const CustomMinicartImage: React.FC = () => {
  const {
    orderForm: { items },
  } = useOrderForm()

  useEffect(() => {
    // Slight delay ensures DOM is rendered before manipulation
    const timeout = setTimeout(() => {
      const images = document.querySelectorAll<HTMLImageElement>(
        '.vtex-product-list-0-x-productImage'
      )

      if (!images.length || !items.length) return

      items.forEach((item, index) => {
        const thumbnailUrl =
          item?.attachments?.find(
            (att: any) => att.name === 'Artifi Customization'
          )?.content?.ThumbnailUrl ||
          item?.attachments?.find(
            (att: any) => att.name === 'Artifi Customization'
          )?.content?.ThumbnailUrl

        const img = images[index]
        if (thumbnailUrl && img) {
          img.src = thumbnailUrl
          img.dataset.src = thumbnailUrl
        }
      })
    }, 300)

    return () => clearTimeout(timeout)
  }, [items])

  return null
}

export default CustomMinicartImage
