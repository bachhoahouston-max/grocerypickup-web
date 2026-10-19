import { Api } from "@/services/service";

export const BUY_IT_AGAIN_SLUG = "buy-it-again";

// Unique, non-deleted products from the user's Completed / Delivered orders,
// de-duplicated and sorted (most recently bought first) by the backend.
export async function getBuyItAgainCategoryProducts(router, page = 1, limit = 24) {
  const response = await Api("get", "getBuyItAgainProducts", "", router, {
    page,
    limit,
  });

  return {
    products: Array.isArray(response?.data) ? response.data : [],
    totalPages: response?.pagination?.totalPages || 0,
  };
}

export async function getBuyItAgainProducts(router) {
  const response = await Api("get", "getStatusCompletedProducts", "", router);
  const products = new Map();

  (Array.isArray(response?.data) ? response.data : []).forEach((booking) => {
    const lines = Array.isArray(booking?.productDetail)
      ? booking.productDetail
      : booking?.productDetail
        ? [booking.productDetail]
        : [];

    lines.forEach((line) => {
      const shortage = Number(line?.shortage || 0);
      const product = line?.product && typeof line.product === "object"
        ? line.product
        : line;
      const productId = product?._id || line?.product?._id || line?._id;
      const availableQuantity = Number(
        product?.Quantity ?? product?.quantity ?? line?.Quantity ?? 0
      );

      if (shortage <= 0 || !productId || availableQuantity <= 0) return;

      products.set(String(productId), {
        ...product,
        _id: productId,
        image: product?.image || line?.image,
        varients: product?.varients || line?.varients ||
          (line?.image ? [{ image: line.image }] : []),
        price_slot: product?.price_slot || line?.price_slot || [],
      });
    });
  });

  return Array.from(products.values());
}

export async function getPurchasedProducts(router) {
  const response = await Api("get", "getStatusCompletedProducts", "", router);
  const products = new Map();

  (Array.isArray(response?.data) ? response.data : []).forEach((booking) => {
    const lines = Array.isArray(booking?.productDetail)
      ? booking.productDetail
      : booking?.productDetail
        ? [booking.productDetail]
        : [];

    lines.forEach((line) => {
      const product =
        line?.product && typeof line.product === "object"
          ? { ...line, ...line.product }
          : line;
      const productId = product?._id || line?.product?._id || line?._id;

      if (!productId) return;

      products.set(String(productId), {
        ...product,
        _id: productId,
        image: product?.image || line?.image,
        varients:
          product?.varients ||
          line?.varients ||
          (line?.image ? [{ image: line.image }] : []),
        price_slot: product?.price_slot || line?.price_slot || [],
      });
    });
  });

  return Array.from(products.values());
}
