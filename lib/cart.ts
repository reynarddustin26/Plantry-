import type { CartItem, Product } from './types';

export interface CartLineItem {
  product: Product;
  quantity: number;
  lineTotalAud: number;
}

export interface CartSummary {
  lineItems: CartLineItem[];
  totalPriceAud: number;
  itemCount: number;
}

export function getCartSummary(items: CartItem[], products: Product[]): CartSummary {
  const productsById = new Map(products.map((p) => [p.id, p]));

  const lineItems: CartLineItem[] = items.flatMap((item) => {
    const product = productsById.get(item.productId);
    if (!product) return [];
    return [
      {
        product,
        quantity: item.quantity,
        lineTotalAud: product.priceAud * item.quantity,
      },
    ];
  });

  return {
    lineItems,
    totalPriceAud: lineItems.reduce((sum, li) => sum + li.lineTotalAud, 0),
    itemCount: lineItems.reduce((sum, li) => sum + li.quantity, 0),
  };
}
