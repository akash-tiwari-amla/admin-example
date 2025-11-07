import React, { useEffect } from 'react'
import { useProduct } from 'vtex.product-context'

const Addtocart = () => {
  const { selectedItem } = useProduct() ?? {}

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ATTACHMENT_NAME = 'Artifi Customization'

    const handleArtifiAddToCartSuccess = async (e: any) => {
      // ✅ Get quantity dynamically here, inside the handler
      const qtyInput = document.querySelector(
        '.vtex-numeric-stepper__input'
      ) as HTMLInputElement | null
      const quantity = qtyInput
        ? parseInt(qtyInput.value.replace(/\D/g, ''), 10) || 1
        : 1

      // console.log('🧮 Current selected quantity:', quantity)

      const artifiDetail = JSON.parse(e?.detail?.data || '{}')
      // console.log('🎨 Artifi detail:', artifiDetail)

      if (!selectedItem || !selectedItem.sellers?.[0]) {
        // console.warn('⚠️ No selected item or seller found.')
        return
      }

      try {
        // Step 1️⃣: Fetch current orderForm
        const orderFormResponse = await fetch('/api/checkout/pub/orderForm', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!orderFormResponse.ok) {
          throw new Error(
            `Failed to fetch orderForm: ${orderFormResponse.statusText}`
          )
        }

        const orderForm = await orderFormResponse.json()
        const orderFormId = orderForm?.orderFormId
        if (!orderFormId) throw new Error('No orderForm ID found')

        const itemToAdd = {
          id: selectedItem.itemId,
          quantity, // use the dynamic quantity
          seller: selectedItem.sellers[0].sellerId,
          attachments: [
            {
              name: ATTACHMENT_NAME,
              content: {
                DesignId: artifiDetail.designId || '',
                ThumbnailUrl: artifiDetail.previewThumbnailImages?.[0] || '',
                PreviewUrl: artifiDetail.previewUrl || '',
              },
            },
          ],
        }

        // console.log('🛒 Preparing to add item with attachment:', itemToAdd)

        // Add to cart
        const addResp = await fetch(
          `/api/checkout/pub/orderForm/${orderFormId}/items`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderItems: [itemToAdd] }),
          }
        )

        if (!addResp.ok) throw new Error(await addResp.text())

        const addResult = await addResp.json()
        // console.log('✅ Added to cart successfully:', addResult)

        // Refresh minicart UI
        if ((window as any).vtexjs?.checkout?.getOrderForm) {
          await (window as any).vtexjs.checkout.getOrderForm()
        } else {
          window.postMessage({ type: 'cart-updated' }, '*')
        }
      } catch (err) {
        console.error('❌ Error adding/updating item in VTEX cart:', err)
      }
    }

    window.addEventListener(
      'artifi-add-to-cart-success',
      handleArtifiAddToCartSuccess
    )
    return () =>
      window.removeEventListener(
        'artifi-add-to-cart-success',
        handleArtifiAddToCartSuccess
      )
  }, [selectedItem])

  return <div id="artifi-add-to-cart" />
}

export default Addtocart
