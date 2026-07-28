import { Api } from "@/services/service";

// Thin wrapper around the standalone /cart-sync API. Kept separate from
// service.js so it's obvious this only talks to the new cart-sync endpoints.
//
// Web and the app build cart items under different field names (web: id/
// price/selectedImage, app: productid/offer/image). The server merges both
// key sets onto every item at save time, so what comes back from
// getSyncedCart always has both — no translation needed on this end.

const getSyncedCart = (router) => Api("get", "cart-sync", "", router);

const saveSyncedCart = (items, router) =>
  Api("put", "cart-sync", { items, platform: "WEB" }, router);

const clearSyncedCart = (router) => Api("delete", "cart-sync", "", router);

export { getSyncedCart, saveSyncedCart, clearSyncedCart };
