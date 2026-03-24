// react/typings/vtex.order-manager.d.ts
declare module 'vtex.order-manager/OrderForm' {
  interface Attachment {
    name: string
    content: Record<string, string>
  }

  interface OrderFormItem {
    id: string
    name: string
    quantity: number
    attachments: Attachment[]
    [key: string]: any
  }

  interface OrderForm {
    items: OrderFormItem[]
    [key: string]: any
  }

  export const useOrderForm: () => {
    orderForm: OrderForm
  }
}
