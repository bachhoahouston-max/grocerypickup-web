import { Api } from "@/services/service";

// Real product id of a cart line. Reward lines use a separate cart id
// (reward_<pointId>) so they never merge with a normal purchase of the product.
export const cartLineProductId = (line) =>
  line?.productSource === "REWARD" ? line?.product_id : line?.id;

// Units of a product across every cart line (bought + redeemed as a reward)
export const cartQtyForProduct = (cart, productId) =>
  (cart || [])
    .filter((line) => String(cartLineProductId(line)) === String(productId))
    .reduce((sum, line) => sum + Number(line?.qty || 0), 0);

// Points held by reward lines in the cart
export const cartRewardPoints = (cart) =>
  (cart || [])
    .filter((line) => line?.productSource === "REWARD")
    .reduce((sum, line) => sum + Number(line?.points || 0) * Number(line?.qty || 1), 0);

// Live stock for a product (same endpoint the normal add-to-cart buttons use)
export const getAvailableStock = async (productId, router) => {
  const res = await Api("get", `checkQuantity/${productId}`, "", router);
  return res?.status ? Number(res?.data?.qty) || 0 : 0;
};

/**
 * Why `extraQty` more of a reward can't go in the cart, or null if it can.
 * reward: { point_id|_id, points, perUserLimit, remainingTotal, qtyInCart }
 * summary: live /rewards/summary response (available, usageByPoint)
 */
export const rewardLimitError = (reward, summary, cart, t, extraQty = 1) => {
  const pointId = String(reward.point_id || reward._id);
  const qtyAfter = Number(reward.qtyInCart || 0) + extraQty;
  const used = Number(summary?.usageByPoint?.[pointId] || 0);

  if (reward.perUserLimit && used + qtyAfter > reward.perUserLimit) {
    return `${t("Limit reached")}: ${reward.perUserLimit} ${t("per customer")}`;
  }
  if (reward.remainingTotal !== null && reward.remainingTotal !== undefined && qtyAfter > reward.remainingTotal) {
    return t("Fully redeemed");
  }
  const pointsNeeded = cartRewardPoints(cart) + Number(reward.points || 0) * extraQty;
  if (summary && pointsNeeded > Number(summary.available || 0)) {
    return `${t("Not enough points")} (${Number(summary.available || 0).toLocaleString()} ${t("pts")})`;
  }
  return null;
};
