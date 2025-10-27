// react/typings/vtex.product-context.d.ts
declare module 'vtex.product-context' {
  export const useProduct: () => {
    product: {
      productId: string
      productName: string
      items: Array<{
        itemId: string
        name: string
        nameComplete: string
        referenceId: Array<{ Value: string }>
        ean: string
      }>
    } | null
    selectedItem: {
      itemId: string
      name: string
      sellers: any[]
    } | null
  }
}
