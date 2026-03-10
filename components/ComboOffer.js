"use client";

import { cartContext } from "@/pages/_app";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import { useState, useEffect, useContext } from "react";
import { IoAddSharp, IoRemoveSharp } from "react-icons/io5";
import AddToCartButton from "./Addtocartbutton";
import { produce } from "immer";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const seedOffers = [
    {
        id: "o1",
        promo_text: "Buy Oolong Tea 6-pack, get Fish Sauce FREE!",
        status: "ACTIVE",
        price: 39.99,
        endDateTime: "2026-03-09T15:30:00",
        limit_per_user: 2,
        accept_coupon: false,
        main_product: {
            _id: "p1",
            name: "Pack of 6 Oolong Tea Plus Drink",
            categoryName: "Beverages",
            long_description: "Tea Plus Oolong Tea is a refreshing bottled oolong tea with a smooth, lightly roasted flavor. Perfect for everyday drinking, meals, or on-the-go refreshment. Enjoy chilled or at room temperature.",
            Quantity: 14,
            varients: [{ image: ["https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=300&fit=crop"] }],
        },
        main_price_slot: { unit: "Pack of 6", our_price: 36.99 },
        free_product: [
            {
                product: {
                    _id: "p4",
                    name: "Vietnamese Fish Sauce 750ml",
                    categoryName: "Condiments",
                    Quantity: 35,
                    varients: [{ image: [] }],
                },
                slot: { unit: "Bottle", our_price: 4.99 },
            },
        ],
    },
    {
        id: "o2",
        promo_text: "Bánh Mì Bread + Pho Broth — The Perfect Pair",
        status: "ACTIVE",
        price: 11.99,
        endDateTime: "2026-03-08T16:00:00",
        limit_per_user: 1,
        accept_coupon: true,
        main_product: {
            _id: "p2",
            name: "Bánh Mì Sandwich Bread Loaf",
            categoryName: "Bakery",
            long_description: "Classic Vietnamese bánh mì bread with a crispy crust and soft, airy interior. Baked fresh daily for the best taste and texture.",
            Quantity: 8,
            varients: [{ image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop"] }],
        },
        main_price_slot: { unit: "Each", our_price: 3.49 },
        free_product: [
            {
                product: {
                    _id: "p3",
                    name: "Pho Broth Concentrate 500ml",
                    categoryName: "Pantry",
                    Quantity: 20,
                    varients: [{ image: [] }],
                },
                slot: { unit: "Bottle", our_price: 8.99 },
            },
        ],
    },
    {
        id: "o3",
        promo_text: "Jasmine Rice 5lb + Fish Sauce Bundle Deal",
        status: "ACTIVE",
        price: 13.49,
        endDateTime: "2026-03-10T10:00:00",
        limit_per_user: 3,
        accept_coupon: false,
        main_product: {
            _id: "p5",
            name: "Jasmine Rice 5lb Bag",
            categoryName: "Pantry",
            long_description: "Premium long-grain jasmine rice from Thailand. Fragrant, fluffy, and perfect for any Asian dish. Non-GMO and naturally gluten-free.",
            Quantity: 50,
            varients: [{ image: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop"] }],
        },
        main_price_slot: { unit: "Bag (5lb)", our_price: 9.99 },
        free_product: [
            {
                product: {
                    _id: "p4b",
                    name: "Vietnamese Fish Sauce 750ml",
                    categoryName: "Condiments",
                    Quantity: 35,
                    varients: [{ image: [] }],
                },
                slot: { unit: "Bottle", our_price: 4.99 },
            },
        ],
    },
    {
        id: "o4",
        promo_text: "Vinacafe Coffee Mix + Bánh Mì Bread Combo",
        status: "ACTIVE",
        price: 7.49,
        endDateTime: "2026-03-11T09:00:00",
        limit_per_user: 2,
        accept_coupon: true,
        main_product: {
            _id: "p6",
            name: "Vinacafe Instant Coffee Mix 3in1",
            categoryName: "Beverages",
            long_description: "Classic Vietnamese 3-in-1 instant coffee with the perfect balance of bold coffee, sugar, and creamer. Individually wrapped sachets.",
            Quantity: 30,
            varients: [{ image: ["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop"] }],
        },
        main_price_slot: { unit: "Pack (20 sachets)", our_price: 5.99 },
        free_product: [
            {
                product: {
                    _id: "p2b",
                    name: "Bánh Mì Sandwich Bread",
                    categoryName: "Bakery",
                    Quantity: 8,
                    varients: [{ image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop"] }],
                },
                slot: { unit: "Each", our_price: 3.49 },
            },
        ],
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getRetailValue = (o) =>
    (o.main_price_slot?.our_price || 0) +
    o.free_product.reduce((s, fp) => s + (fp.slot?.our_price || 0), 0);

const getImg = (p) => p?.varients?.[0]?.image?.[0];

const EMOJI = {
    Beverages: "🧋", Bakery: "🍞", Pantry: "🥫",
    Condiments: "🫙", Grains: "🌾", Snacks: "🍟",
};

// ─── Countdown ────────────────────────────────────────────────────────────────
const useCountdown = (endDateTime) => {
    const calc = () => {
        const diff = new Date(endDateTime) - new Date();
        if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
        return {
            d: Math.floor(diff / 86400000),
            h: Math.floor((diff % 86400000) / 3600000),
            m: Math.floor((diff % 3600000) / 60000),
            s: Math.floor((diff % 60000) / 1000),
        };
    };
    const [t, setT] = useState(calc);
    useEffect(() => {
        const id = setInterval(() => setT(calc()), 1000);
        return () => clearInterval(id);
    }, [endDateTime]);
    const pad = (n) => String(n).padStart(2, "0");
    // return `${t.d > 0 ? t.d + "d:" : ""}${pad(t.h)}h:${pad(t.m)}m:${pad(t.s)}s`;
    return `${t.d > 0 ? t.d + "d:" : ""}${pad(t.h)}h:${pad(t.m)}m`;
};

// ─── Product Avatar ───────────────────────────────────────────────────────────
const ProductAvatar = ({ product, className = "" }) => {
    const img = getImg(product);
    return img ? (
        <img
            src={img}
            alt={product.name}
            className={`object-cover ${className}`}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
    ) : (
        <div className={`flex items-center justify-center bg-gray-50 text-3xl ${className}`}>
            {EMOJI[product?.categoryName] || "🛒"}
        </div>
    );
};

// ─── Countdown Badge ──────────────────────────────────────────────────────────
const CountdownBadge = ({ endDateTime }) => {
    const time = useCountdown(endDateTime);
    return (
        <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow-md">
            <span className="text-xs">⏰</span>
            <span className="text-xs text-gray-500 font-medium">Ending in</span>
            <span className="text-xs font-bold text-red-500 tabular-nums">{time}</span>
        </div>
    );
};

// ─── Offer Modal ──────────────────────────────────────────────────────────────
const OfferModal = ({ offer, onClose, onAddToCart, inCart }) => {
    const [added, setAdded] = useState(false);
    const retail = getRetailValue(offer);
    const savings = retail - parseFloat(offer.price);
    const savingsPct = Math.round((savings / retail) * 100);
    const time = useCountdown(offer.endDateTime);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const handleAdd = () => {
        setAdded(true);
        onAddToCart(offer);
        setTimeout(() => { setAdded(false); onClose(); }, 900);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]"
                style={{ animation: "sheetUp 0.3s cubic-bezier(0.34,1.3,0.64,1)" }}>

                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>

                {/* Green header */}
                <div className="bg-gradient-to-r from-green-800 to-green-600 px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <p className="text-green-300 text-xs font-bold uppercase tracking-wider mb-1">🎁 Combo Deal</p>
                            <h2 className="text-white font-bold text-base leading-snug">{offer.promo_text}</h2>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <button
                                onClick={onClose}
                                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs hover:bg-white/30 transition-colors">
                                ✕
                            </button>
                            <div className="bg-red-500 text-white font-black text-sm px-3 py-1 rounded-full shadow-lg">
                                SAVE {savingsPct}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Countdown bar */}
                <div className="bg-red-50 border-b border-red-100 px-5 py-2.5 flex items-center gap-2">
                    <span className="text-sm">⏰</span>
                    <span className="text-xs text-red-600 font-semibold">Offer ends in:</span>
                    <span className="text-xs font-black text-red-600 tabular-nums bg-red-100 px-2 py-0.5 rounded-full">{time}</span>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

                    {/* Main product */}
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Main Product</p>
                        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-3">
                            <ProductAvatar product={offer.main_product} className="w-16 h-16 rounded-xl flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">{offer.main_product.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{offer.main_price_slot.unit} · {offer.main_product.categoryName}</p>
                                {offer.main_product.long_description && (
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{offer.main_product.long_description}</p>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-base font-black text-green-700">${offer.main_price_slot.our_price.toFixed(2)}</p>
                                <p className="text-xs text-gray-400">retail</p>
                            </div>
                        </div>
                    </div>

                    {/* Free products */}
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Free Products</p>
                        <div className="space-y-2">
                            {offer.free_product.map((fp, i) => (
                                <div key={i} className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl p-3">
                                    <ProductAvatar product={fp.product} className="w-16 h-16 rounded-xl flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">{fp.product.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{fp.slot.unit} · {fp.product.categoryName}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs text-gray-300 line-through">${fp.slot.our_price.toFixed(2)}</p>
                                        <span className="bg-green-700 text-white text-xs font-black px-2 py-0.5 rounded-full">FREE</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price breakdown */}
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Total retail value</span>
                            <span className="text-gray-400 line-through">${retail.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Your savings</span>
                            <span className="text-green-700 font-bold">-${savings.toFixed(2)} ({savingsPct}% OFF)</span>
                        </div>
                        <div className="border-t border-orange-200 pt-2 flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-700">Combo Price</span>
                            <span className="text-2xl font-black text-green-700">${parseFloat(offer.price).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Meta chips */}
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { icon: "🔁", label: "Limit", value: `${offer.limit_per_user}× / user` },
                            { icon: "🏷️", label: "Coupon", value: offer.accept_coupon ? "✓ Accepted" : "✗ Not valid" },
                            { icon: "📦", label: "Stock", value: `${offer.main_product.Quantity} left` },
                        ].map((d) => (
                            <div key={d.label} className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center">
                                <p className="text-lg mb-1">{d.icon}</p>
                                <p className="text-xs text-gray-400">{d.label}</p>
                                <p className="text-xs font-bold text-gray-700 mt-0.5">{d.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="px-5 py-4 border-t border-gray-100 bg-white flex-shrink-0">
                    <button
                        onClick={handleAdd}
                        className={`w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all duration-200 ${added
                            ? "bg-green-700 shadow-lg shadow-green-200"
                            : "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 active:scale-95"
                            }`}>
                        {added ? "✓ Added to Cart!" : `🛒 BUY COMBO NOW — $${parseFloat(offer.price).toFixed(2)}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Offer Card ───────────────────────────────────────────────────────────────
const OfferCard = ({ offer, onOpen, inCart, onAddToCart, loader, toaster }) => {
    const retail = getRetailValue(offer);
    const savings = retail - parseFloat(offer.price);
    const [cartData, setCartData] = useContext(cartContext);
    const savingsPct = Math.round((savings / retail) * 100);
    const router = useRouter()

    const cartItem = cartData.find(
        (cartItem) => cartItem.combo_id === offer?._id
    );
    const itemQuantity = cartItem ? cartItem.qty : 0;

    const handleQuantity = async (item) => {
        try {
            loader(true);

            const res = await Api(
                "get",
                `checkQuantity/${item?._id}`,
                "",
                router
            );

            loader(false);

            return res.status ? res.data.qty : 0;
        } catch (err) {
            loader(false);
            toaster({ type: "error", message: err?.message });
            return 0;
        }
    };


    const handleAddToCart = async (item) => {
        console.log()
        const availableQuantity = await handleQuantity(item?.main_product);
        const availableFreeQuantity = await handleQuantity(item?.free_product[0].product);

        if (availableQuantity <= 0) {
            toaster({
                type: "error",
                message:
                    "Main product is currently out of stock. Please choose a different item.",
            });
            return;
        }

        if (availableFreeQuantity <= 0) {
            toaster({
                type: "error",
                message:
                    "Free product is currently out of stock. Please choose a different item.",
            });
            return;
        }


        const updatedCart = produce(cartData, (draft) => {
            const existingItemIndex = draft.findIndex((f) => f.combo_id === item?._id);

            if (existingItemIndex !== -1 && draft[existingItemIndex].qty + 1 > availableQuantity) {
                console.log(draft[existingItemIndex]?.qty + 1 > availableQuantity)
                toaster({
                    type: "error",
                    message:
                        "Item is not available in this quantity in stock. Please choose a different item.",
                });
                return
            } else {
                const price = parseFloat(item.price);
                item.product = item.main_product
                let price_slot = {
                    value: item?.price_slot?.value,
                    unit: item?.price_slot?.unit,
                    other_price: item?.price_slot?.our_price,
                    our_price: item?.price,
                };

                if (existingItemIndex === -1) {
                    console.log(item)
                    draft.push({
                        ...item,
                        name: item?.product.name,
                        vietnamiesName: item?.product.vietnamiesName,
                        id: item?.product?._id,
                        selectedColor: item?.product.varients?.[0] || {},
                        selectedImage: item.product?.varients[0]?.image[0] || "",
                        BarCode: item?.product.DateBarCode || "",
                        total: price,
                        isCurbSidePickupAvailable: item?.product?.isCurbSidePickupAvailable,
                        isInStoreAvailable: item?.product?.isInStoreAvailable,
                        isNextDayDeliveryAvailable: item?.product?.isNextDayDeliveryAvailable,
                        isReturnAvailable: item?.product?.isReturnAvailable,
                        isShipmentAvailable: item?.product?.isShipmentAvailable,
                        qty: 1,
                        price: price ?? 0,
                        price_slot: price_slot || {},
                        productSource: "COMBO",
                        // SaleID: item?._id,
                        tax_code: item?.product.tax_code,
                        free_product: item?.free_product,
                        combo_id: item?._id
                    });
                } else {
                    draft[existingItemIndex].qty += 1;
                    draft[existingItemIndex].total = (
                        price * draft[existingItemIndex].qty
                    ).toFixed(2);
                }
            }
            toaster({ type: "success", message: "Product added to cart" });
        });
        const updatedCartData = updatedCart.filter(f => f !== null);

        setCartData(updatedCartData);
        localStorage.setItem("addCartDetail", JSON.stringify(updatedCartData));

    };

    const handleRemoveFromCart = (item) => {
        const updatedCart = produce(cartData, (draft) => {
            const existingItemIndex = draft.findIndex((f) => f.combo_id === item._id);
            const price = parseFloat(item.price);
            console.log("Removing item:", item, "Existing index:", existingItemIndex, "Current cart:", cartData);
            if (existingItemIndex !== -1) {
                if (draft[existingItemIndex].qty > 1) {
                    draft[existingItemIndex].qty -= 1;
                    draft[existingItemIndex].total = (
                        price * draft[existingItemIndex].qty
                    ).toFixed(2);
                } else {
                    draft.splice(existingItemIndex, 1);
                }
            } else {
                draft[existingItemIndex] = null;
            }
        });
        const updatedCartData = updatedCart.filter(f => f !== null);
        setCartData(updatedCartData);
        localStorage.setItem("addCartDetail", JSON.stringify(updatedCartData));
    };


    return (
        <div

            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden cursor-pointer group">

            {/* Image area */}
            <div className="relative bg-gray-50 px-4 pt-10 pb-2 flex items-center justify-center gap-3 min-h-[160px]">

                {/* Countdown badge top-left */}
                <div className="absolute top-2.5 left-2.5 z-10">
                    <CountdownBadge endDateTime={offer.endDateTime} />
                </div>

                {/* Save badge top-right */}
                {/* <div className="absolute top-2.5 right-2.5 z-10 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md shadow-red-200">
                    Save ${savings.toFixed(2)}
                </div> */}

                {/* Main product image */}
                <div className="group-hover:scale-105 transition-transform duration-200"
                    onClick={() => onOpen(offer)}
                >
                    <ProductAvatar
                        product={offer.main_product}
                        className="w-24 h-24 rounded-2xl shadow-md"
                    />
                </div>

                {/* Plus + FREE divider */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0"
                    onClick={() => onOpen(offer)}
                >
                    <span className="text-gray-300 font-bold text-xl">+</span>
                    <span className="bg-green-700 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow">FREE</span>
                </div>

                {/* Free product images */}
                <div className="flex gap-2"
                    onClick={() => onOpen(offer)}
                >
                    {offer.free_product.map((fp, i) => (
                        <div key={i} className="group-hover:scale-105 transition-transform duration-200 delay-75">
                            <ProductAvatar
                                product={fp.product}
                                className="w-16 h-16 rounded-xl shadow-md"
                            />
                        </div>
                    ))}
                </div>

                {/* In-cart badge */}
                {inCart && (
                    <div className="absolute bottom-2.5 right-2.5 bg-green-700 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                        ✓ In Cart
                    </div>
                )}
                <div className="absolute bottom-0 right-2.5 z-50">
                    {offer?.main_product?.Quantity <= 0 ? (
                        <button
                            className="w-full py-2 bg-gray-400 text-white font-semibold rounded-full cursor-not-allowed"
                        >
                            {t("Out of Stock")}
                        </button>
                    ) : itemQuantity > 0 ? (
                        <div className="flex justify-center items-center">
                            <div className="flex justify-between items-center gap-2 md:w-[200px] w-[150px] bg-gray-100 p-1 rounded-2xl">
                                <div
                                    className="bg-custom-green cursor-pointer rounded-full p-2 flex justify-center items-center"
                                    onClick={() => handleRemoveFromCart(offer)}
                                >
                                    <IoRemoveSharp className="text-white w-5 h-5" />
                                </div>
                                <p className="text-center font-medium text-black">{itemQuantity}</p>
                                <div
                                    className="bg-custom-green cursor-pointer rounded-full p-2 flex justify-center items-center"
                                    onClick={() => handleAddToCart(offer)}
                                >
                                    <IoAddSharp className="text-white w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mx-auto">
                            <button
                                className="bg-custom-green bg-custom-green text-white font-semibold px-2 py-2 rounded-full text-sm cursor-pointer flex items-center gap-2 transition-colors"
                                onClick={() => handleAddToCart(offer)}
                            >
                                {/* <FiShoppingCart className="w-5 h-5" />
                                              {t("Add")} */}
                                <IoAddSharp className="text-white w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>

            </div>

            {/* Card body */}
            <div className="px-4 pt-0 pb-0">


                {/* Category label */}
                {/* <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">
                    {offer.main_product.categoryName} Combo
                </p> */}

                {/* Title */}
                <p className="text-sm font-normal text-gray-800 leading-snug line-clamp-2  min-h-[40px]">
                    {offer.promo_text}
                </p>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-black text-[#E53935]">${parseFloat(offer.price).toFixed(2)}</span>
                            <span className="text-xs text-gray-300 line-through">${retail.toFixed(2)}</span>
                            <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded mt-0.5">
                                Save ${savings.toFixed(2)}
                            </span>
                        </div>

                    </div>

                    {/* Add to cart button */}

                </div>

                {/* Product tags */}
                <div className="flex flex-wrap gap-1.5 mb-3 mt-1">
                    <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        📦 {offer.main_product.name.length > 20 ? offer.main_product.name.slice(0, 20) + "…" : offer.main_product.name}
                    </span>
                    {offer.free_product.map((fp, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-green-50 border border-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            🎁 {fp.product.name.length > 18 ? fp.product.name.slice(0, 18) + "…" : fp.product.name}
                        </span>
                    ))}
                </div>

                {/* Price row */}

            </div>
        </div>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ComboOfferCards(props) {
    const router = useRouter();
    const [selected, setSelected] = useState(null);
    const [cart, setCart] = useState([]);
    const [offers, setOffers] = useState([]);

    useEffect(() => {
        getOffer()
    }, [])

    const getOffer = async () => {
        props.loader(true);

        Api("get", "getComboOffers", router).then(
            (res) => {
                props.loader(false);
                if (res?.status) {

                    setOffers(res.data)
                }
            },
            (err) => {
                props.loader(false);
                console.log(err);
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };


    const addToCart = (o) => {
        if (!cart.find((c) => c.id === o.id)) setCart((p) => [...p, o]);
    };
    const inCart = (id) => !!cart.find((c) => c.id === id);

    return (
        <div className=" bg-gray-50 p-6">

            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🎁</span>
                    <div>
                        <h2 className="text-[20px] md:text-2xl font-bold text-[#2E7D32]">Combo Offers</h2>
                        <p className="text-xs text-gray-500">Bundle deals — buy one, get one FREE!</p>
                    </div>
                </div>
                {cart.length > 0 && (
                    <div className="flex items-center gap-2 bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-green-200">
                        🛒 {cart.length} combo{cart.length > 1 ? "s" : ""} in cart
                    </div>
                )}
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-4">
                {offers.map((offer) => (
                    <OfferCard
                        key={offer._id}
                        offer={offer}
                        onOpen={setSelected}
                        onAddToCart={addToCart}
                        inCart={inCart(offer.id)}
                        {...props}
                    />
                ))}
            </div>

            {/* Modal */}
            {selected && (
                <OfferModal
                    offer={selected}
                    onClose={() => setSelected(null)}
                    onAddToCart={addToCart}
                    inCart={inCart(selected.id)}
                />
            )}

            <style>{`
        @keyframes sheetUp {
          from { opacity: 0; transform: translateY(48px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}