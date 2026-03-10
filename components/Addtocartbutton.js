import { useContext } from "react";
import { useRouter } from "next/router";
import { IoRemoveSharp, IoAddSharp } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { produce } from "immer";
import { cartContext } from "@/pages/_app";
import { Api } from "@/services/service";

/**
 * AddToCartButton
 *
 * All cart logic lives here — parent only needs to pass:
 *  - item      : the sale/product item object
 *  - loader    : (bool) => void
 *  - toaster   : ({ type, message }) => void
 */
const AddToCartButton = ({ item, loader, toaster }) => {

    const router = useRouter();
    const { t } = useTranslation();
    const [cartData, setCartData] = useContext(cartContext);
    console.log(item)
    // Derive quantity from cart context directly
    const cartItem = cartData.find((c) => c.id === item?.main_product ? item._id : item?.product?._id,);
    const quantity = cartItem ? cartItem.qty : 0;

    // ── 1. Check live stock from API ────────────────────────────────────────────
    const checkAvailableQty = async () => {
        try {
            loader(true);
            const res = await Api("get", `checkQuantity/${item?.product?._id}`, "", router);
            loader(false);
            return res.status ? res.data.qty : 0;
        } catch (err) {
            loader(false);
            toaster({ type: "error", message: err?.message });
            return 0;
        }
    };

    // ── 2. Persist cart to state + localStorage ─────────────────────────────────
    const persistCart = (updatedCart) => {
        const cleaned = updatedCart.filter((f) => f !== null);
        setCartData(cleaned);
        localStorage.setItem("addCartDetail", JSON.stringify(cleaned));
    };

    // ── 3. Add one unit ─────────────────────────────────────────────────────────
    const handleAdd = async () => {
        const availableQty = await checkAvailableQty();

        if (availableQty <= 0) {
            toaster({
                type: "error",
                message: "This item is currently out of stock. Please choose a different item.",
            });
            return;
        }

        const updated = produce(cartData, (draft) => {
            const idx = draft.findIndex((f) => f.id === item?.product?._id);

            // Already in cart but would exceed stock
            if (idx !== -1 && draft[idx].qty + 1 > availableQty) {
                toaster({
                    type: "error",
                    message: "Item is not available in this quantity in stock.",
                });
                return;
            }

            const price = parseFloat(item.price);
            const price_slot = {
                value: item?.price_slot?.value,
                unit: item?.price_slot?.unit,
                other_price: item?.price_slot?.our_price,
                our_price: item?.price,
            };

            if (idx === -1) {
                // First time adding
                draft.push({
                    ...item,
                    name: item?.product?.name,
                    vietnamiesName: item?.product?.vietnamiesName,
                    id: item?.main_product ? item._id : item?.product?._id,
                    selectedColor: item?.product?.varients?.[0] || {},
                    selectedImage: item?.product?.varients?.[0]?.image?.[0] || "",
                    BarCode: item?.product?.DateBarCode || "",
                    total: price,
                    isCurbSidePickupAvailable: item?.product?.isCurbSidePickupAvailable,
                    isInStoreAvailable: item?.product?.isInStoreAvailable,
                    isNextDayDeliveryAvailable: item?.product?.isNextDayDeliveryAvailable,
                    isReturnAvailable: item?.product?.isReturnAvailable,
                    isShipmentAvailable: item?.product?.isShipmentAvailable,
                    qty: 1,
                    price: price ?? 0,
                    price_slot,
                    productSource: "SALE",
                    SaleID: item?._id,
                    tax_code: item?.product?.tax_code,
                });
            } else {
                // Already in cart — increment
                draft[idx].qty += 1;
                draft[idx].total = (price * draft[idx].qty).toFixed(2);
            }

            toaster({ type: "success", message: "Product added to cart" });
        });

        persistCart(updated);
    };

    // ── 4. Remove one unit ──────────────────────────────────────────────────────
    const handleRemove = () => {
        const updated = produce(cartData, (draft) => {
            const idx = draft.findIndex((f) => f._id === item._id);
            const price = parseFloat(item.price);

            if (idx !== -1) {
                if (draft[idx].qty > 1) {
                    draft[idx].qty -= 1;
                    draft[idx].total = (price * draft[idx].qty).toFixed(2);
                } else {
                    draft.splice(idx, 1);
                }
            } else {
                draft[idx] = null;
            }
        });

        persistCart(updated);
    };

    // ── UI: Out of stock ────────────────────────────────────────────────────────
    if (item?.product?.Quantity <= 0) {
        return (
            <button
                disabled
                className="py-1.5 px-3 bg-gray-300 text-white text-xs font-semibold rounded-full cursor-not-allowed">
                {t("Out of Stock")}
            </button>
        );
    }

    // ── UI: In cart → stepper ───────────────────────────────────────────────────
    if (quantity > 0) {
        return (
            <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl">
                    <button
                        onClick={handleRemove}
                        className="bg-[#2E7D32] hover:bg-green-800 cursor-pointer rounded-full p-1.5 flex items-center justify-center transition-colors">
                        <IoRemoveSharp className="text-white w-5 h-5" />
                    </button>
                    <span className="min-w-[24px] text-center font-semibold text-sm text-black">
                        {quantity}
                    </span>
                    <button
                        onClick={handleAdd}
                        className="bg-[#2E7D32] hover:bg-green-800 cursor-pointer rounded-full p-1.5 flex items-center justify-center transition-colors">
                        <IoAddSharp className="text-white w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    // ── UI: Not in cart → + button ──────────────────────────────────────────────
    return (
        <button
            onClick={handleAdd}
            className="bg-[#2E7D32] hover:bg-green-800 text-white rounded-full p-2 flex items-center justify-center transition-colors shadow-md cursor-pointer">
            <IoAddSharp className="w-6 h-6" />
        </button>
    );
};

export default AddToCartButton;