import React, { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { MdFileDownload, MdPublic, MdPhone, MdLocationOn } from "react-icons/md";
import Barcode from "react-barcode";
import { Api } from "@/services/service";
import { useRouter } from "next/router";

const Invoice = ({ order, productsCount, totalAmount, productItem }) => {
  const printRef = useRef(null);
  const router = useRouter();
  const invoiceId = order?.orderId || order?._id;

  // Pre-load all product images as base64
  const [imageMap, setImageMap] = useState({});
  const [imagesReady, setImagesReady] = useState(false);
  // onBeforePrint's polling closure is created once per click and must see live
  // updates, so mirror the ready flag in a ref rather than reading state directly
  // (a stale closure over `imagesReady` would poll a value frozen at click-time
  // forever, only succeeding on a later click whose closure already saw `true`).
  const imagesReadyRef = useRef(false);

  useEffect(() => {
    if (!productItem?.length) { imagesReadyRef.current = true; setImagesReady(true); return; }

    const urls = [];
    productItem.forEach((item) => {
      const url = item?.product?.varients?.[0]?.image?.[0];
      if (url && !urls.includes(url)) urls.push(url);
      item?.combo_id?.free_product?.forEach((fp) => {
        const furl = fp?.product?.varients?.[0]?.image?.[0];
        if (furl && !urls.includes(furl)) urls.push(furl);
      });
    });

    if (!urls.length) { imagesReadyRef.current = true; setImagesReady(true); return; }

    imagesReadyRef.current = false;
    setImagesReady(false);
    Promise.all(
      urls.map((url) =>
        Api("get", `/changeBase64?url=${encodeURIComponent(url)}`, "", router)
          .then((res) => ({ url, b64: res?.base64 || null }))
          .catch(() => ({ url, b64: null }))
      )
    ).then((results) => {
      const map = {};
      results.forEach(({ url, b64 }) => { if (b64) map[url] = b64; });
      setImageMap(map);
      imagesReadyRef.current = true;
      setImagesReady(true);
    });
  }, [productItem]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${invoiceId || Date.now()}`,
    onBeforePrint: () =>
      new Promise((resolve) => {
        if (imagesReadyRef.current) { resolve(); return; }
        const check = setInterval(() => {
          if (imagesReadyRef.current) { clearInterval(check); resolve(); }
        }, 100);
      }),
  });

  function formatOrderDateTime(createdAt) {
    const d = new Date(createdAt || Date.now());
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()} ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}`;
  }

  function convertISODateToFormattedString(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "Invalid Date";
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  const customerName =
    `${order?.Local_address?.name || ""} ${order?.Local_address?.lastname || ""}`.trim() ||
    `${order?.user?.username || ""} ${order?.user?.lastname || ""}`.trim() ||
    "N/A";

  const items = productItem || [];

  const total = parseFloat(
    items.reduce((sum, i) =>
      sum + (Number(i?.total) > 0 ? Number(i?.total) : Number(i.price) * Number(i.qty)), 0
    ).toFixed(2)
  );

  const totalQty = order?.productDetail?.reduce((sum, item) => {
    let qty = item?.qty || 0;
    if (item?.combo_id?.free_product?.length > 0) qty += item.combo_id.free_product.length * (item?.qty || 1);
    return sum + qty;
  }, 0);

  let orderType = "Store Pickup";
  if (order?.isLocalDelivery) orderType = "Local Delivery";
  if (order?.isShipmentDelivery) orderType = "Shipment Delivery";
  if (order?.isDriveUp) orderType = "Curbside Pickup";

  const frozenItems = items.filter((i) => i?.product?.categoryName === "Frozen Foods");
  const nonFrozenItems = items.filter((i) => i?.product?.categoryName !== "Frozen Foods");

  // Pickup checklist verification / refund summary — only present once staff has
  // run the quantity-verification checklist against this order.
  const hasChecklist = items.some((i) => i?.fullfillQty !== undefined && i?.fullfillQty !== null);

  // Free products are granted 1:1 with their parent item's qty (see Stripe.js)
  // and are tracked in freeProductFulfillment — fold them into these totals so
  // Ordered/Packed/Shorted stay reconcilable even when combos are involved.
  const freeProductTotals = (fp, item) => {
    const fulfillment = item?.freeProductFulfillment?.find((f) => f?.product == fp?.product?._id);
    const ordered = Number(item?.qty || 0);
    const packed =
      fulfillment?.fullfillQty !== undefined && fulfillment?.fullfillQty !== null
        ? Number(fulfillment.fullfillQty)
        : ordered;
    const shortage = Number(fulfillment?.shortage || 0);
    return { ordered, packed, shortage };
  };

  const itemsOrdered = items.reduce((sum, i) => {
    const freeOrdered = (i?.combo_id?.free_product || []).reduce(
      (s, fp) => s + freeProductTotals(fp, i).ordered, 0,
    );
    return sum + Number(i?.qty || 0) + freeOrdered;
  }, 0);
  const itemsPacked = items.reduce((sum, i) => {
    const freePacked = (i?.combo_id?.free_product || []).reduce(
      (s, fp) => s + freeProductTotals(fp, i).packed, 0,
    );
    return sum + Number(i?.fullfillQty !== undefined && i?.fullfillQty !== null ? i.fullfillQty : i?.qty || 0) + freePacked;
  }, 0);
  const itemsShorted = items.reduce((sum, i) => {
    const freeShorted = (i?.combo_id?.free_product || []).reduce(
      (s, fp) => s + freeProductTotals(fp, i).shortage, 0,
    );
    return sum + Number(i?.shortage || 0) + freeShorted;
  }, 0);
  const refundedItems = items.filter((i) => Number(i?.refundAmount) > 0);
  // Quantity actually refunded, not the count of distinct product lines — a single
  // product short by several units should read as that many refunded items, matching
  // "Items Shorted" above it rather than counting as just 1 refunded line.
  const refundedQty = refundedItems.reduce((sum, i) => sum + Number(i?.shortage || 0), 0);
  // Sales tax refunded is tracked per item (only products taxed under txcd_99999999
  // at 8.25% carry a taxAmount), not a blanket proportion of the order's total tax.
  const taxAdjustment = parseFloat(
    refundedItems.reduce((sum, i) => sum + Number(i?.taxAmount || 0), 0).toFixed(2)
  );
  const totalRefundAmount = parseFloat(
    refundedItems.reduce((sum, i) => sum + Number(i?.refundAmount || 0), 0).toFixed(2)
  );
  const productRefundTotal = parseFloat((totalRefundAmount - taxAdjustment).toFixed(2));
  const originalTax = Number(order?.totalTax || 0);
  const adjustedSubtotal = parseFloat((total - productRefundTotal).toFixed(2));
  const adjustedTax = parseFloat((originalTax - taxAdjustment).toFixed(2));
  const totalCharged = parseFloat((Number(totalAmount) - totalRefundAmount).toFixed(2));

  const refundStatuses = refundedItems.map((i) => i?.refund_status || "Pending");
  const refundStatus =
    refundStatuses.length === 0
      ? ""
      : refundStatuses.every((s) => s === "Processed")
        ? "Processed"
        : refundStatuses.every((s) => s === "Rejected")
          ? "Rejected"
          : "Pending";

  const rowStatus = (item) => {
    const shortage = Number(item?.shortage || 0);
    if (shortage <= 0) return { label: "No Shortage", color: "#16a34a" };
    if (item?.refund_status === "Processed") return { label: "Refunded", color: "#206B3A" };
    return { label: "Shortage", color: "#dc2626" };
  };

  const imgStyle = { width: "36px", height: "36px", objectFit: "cover", borderRadius: "4px", flexShrink: 0 };
  const cellStyle = { padding: "0.35rem 0.4rem", border: "1px solid #e5e7eb", wordBreak: "break-word", overflowWrap: "anywhere" };

  const ItemCell = ({ item, freeLabel }) => {
    const url = item?.product?.varients?.[0]?.image?.[0];
    const b64 = url ? imageMap[url] : null;
    // free products store their name at item.product.name; regular items at item.name
    const name = item?.name || item?.product?.name || "—";
    return (
      <td style={cellStyle}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
          {b64
            ? <img src={b64} alt="" style={imgStyle} />
            : url
              ? <img src={url} alt="" style={imgStyle} crossOrigin="anonymous" />
              : <div style={{ ...imgStyle, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#9ca3af" }}>No img</div>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            {freeLabel && <span style={{ background: "#22c55e", color: "white", fontSize: "9px", padding: "1px 6px", borderRadius: "3px", display: "inline-block", marginBottom: "2px" }}>FREE</span>}
            <div style={{ fontSize: "0.7rem", wordBreak: "break-word", overflowWrap: "anywhere" }}>{name}</div>
          </div>
        </div>
      </td>
    );
  };

  const VerificationCells = ({ item }) => {
    const packed = item?.fullfillQty !== undefined && item?.fullfillQty !== null ? item.fullfillQty : item?.qty;
    const shortage = Number(item?.shortage || 0);
    const st = rowStatus(item);
    const taxAmount = Number(item?.taxAmount || 0);
    const refundAmount = Number(item?.refundAmount || 0);
    return (
      <>

        <td style={{ ...cellStyle, textAlign: "right", color: shortage > 0 ? "#dc2626" : undefined }}>{shortage}</td>
        <td style={cellStyle}>{item?.reason || "-"}</td>
        <td style={{ ...cellStyle, textAlign: "center", fontSize: '10px' }}>
          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: st.color, marginRight: "6px" }} />
          <span style={{ color: st.color, fontWeight: 600 }}>{st.label}</span>
        </td>
        <td style={{ ...cellStyle, textAlign: "right" }}>{taxAmount > 0 ? `$${taxAmount.toFixed(2)}` : "-"}</td>
        <td style={{ ...cellStyle, textAlign: "right", color: refundAmount > 0 ? "#dc2626" : undefined, fontWeight: refundAmount > 0 ? 600 : "normal" }}>
          {refundAmount > 0 ? `$${refundAmount.toFixed(2)}` : "-"}
        </td>
      </>
    );
  };

  const orderDateTime = formatOrderDateTime(order?.createdAt);
  const website = "www.bachhoahouston.com";

  const Header = () => (
    <div style={{ justifyContent: "space-between", alignItems: "center", display: "flex", borderBottom: "1px solid #e5e7eb", paddingBottom: "10px", marginBottom: "5px" }}>
      <div>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#206B3A", margin: 0 }}>BACH HOA HOUSTON</h1>
        <p style={{ fontSize: "0.875rem", margin: 0 }}>{website}</p>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontSize: "1.2rem", color: "#206B3A", margin: 0 }}>Order type: <strong>{orderType}</strong></p>
        <p style={{ fontSize: "0.875rem", margin: 0 }}>Order ID #: <strong>{invoiceId}</strong></p>
        <p style={{ fontSize: "0.875rem", margin: 0 }}>Order Date: {orderDateTime}</p>
        {(order?.isLocalDelivery || order?.isShipmentDelivery) && order?.dateOfDelivery && (
          <p style={{ fontSize: "0.875rem", margin: 0 }}>Delivery Date: {convertISODateToFormattedString(order.dateOfDelivery)}</p>
        )}
        {(order?.isOrderPickup || order?.isDriveUp) && order?.dateOfDelivery && (
          <p style={{ fontSize: "0.875rem", margin: 0 }}>Pickup Date: {convertISODateToFormattedString(order.dateOfDelivery)}</p>
        )}
      </div>
    </div>
  );

  // .print-footer is display:none by default and only laid out (position:
  // fixed) inside @media print — a *nested* position:fixed element is
  // positioned against the viewport, not against its position:fixed
  // off-screen ancestor, so doing this via inline style would make the bar
  // render as a floating strip over the real admin UI at all times.
  // Chrome's print engine replicates fixed-position elements on every
  // physical page, which is how this bar repeats across the whole PDF.
  const PrintFooter = () => (
    <div className="print-footer">
      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <MdPublic /> {website}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <MdPhone /> (832) 230-9288
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <MdLocationOn /> 11360 Bellaire Blvd Ste 700, Houston, TX 77072, USA
      </span>
    </div>
  );

  const BilledTo = ({ showPhone = true, noMargin = false }) => (
    <div style={{ marginBottom: noMargin ? 0 : "1.5rem", display: "grid" }}>
      <h2 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.25rem" }}>Billed To:</h2>
      <span>{customerName}</span>
      <span>{order?.Local_address?.address || order?.user?.email}</span>
      {showPhone && <span>{order?.Local_address?.phoneNumber || order?.user?.number}</span>}
      {order?.Local_address?.BusinessAddress && <span>Business Address: {order?.Local_address?.BusinessAddress}</span>}
      {order?.Local_address?.ApartmentNo && <span>Apartment No: {order?.Local_address?.ApartmentNo}</span>}
      {order?.Local_address?.SecurityGateCode && <span>Security Gate Code: {order?.Local_address?.SecurityGateCode}</span>}
    </div>
  );

  return (
    <div>
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 text-gray-700 py-1 px-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300"
        type="button"
        aria-label="Print Invoice"
      >
        {/* <span>Invoice</span> */}
        <MdFileDownload className="text-xl" />
      </button>

      {/* Off-screen wrapper — printRef inside so cloneNode doesn't copy positioning */}
      <div style={{ position: "fixed", top: 0, left: "-10000px", width: "800px", zIndex: -9999 }}>
        <div ref={printRef} style={{ background: "#fff" }}>
          <style>{`
            .print-footer { display: none; }
            @media print {
              @page { size: A4; margin: 10mm 10mm 16mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .page-break { page-break-after: always; break-after: page; }
              .print-footer {
                display: flex;
                position: fixed;
                left: 10px;
                right: 10px;
                bottom: 6px;
                justify-content: space-between;
                align-items: center;
                gap: 10px;
                border-top: 1px solid #e5e7eb;
                padding-top: 6px;
                background: #fff;
                font-size: 9px;
                color: #444;
              }
            }
          `}</style>

          <PrintFooter />

          {/* PAGE 1: Label */}
          {/* <div className="page-break" style={{ fontFamily: "sans-serif", color: "black", padding: "10px", paddingBottom: "30px" }}>
            <Header />
            <div style={{ display: "flex", justifyContent: "flex-start", margin: "16px 0" }}>
              <Barcode value={order.orderId} width={1.5} height={60} fontSize={12} />
            </div>
            <BilledTo showPhone={false} />
          </div> */}

          {/* PAGE 2+: Full invoice */}
          <div style={{ fontFamily: "sans-serif", color: "black", padding: "10px", paddingBottom: "30px" }}>
            <Header />
            <div style={{ display: "flex", justifyContent: "flex-start", margin: "16px 0" }}>
              <Barcode value={order.orderId} width={1.5} height={60} fontSize={12} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              <div style={{ flex: "1 1 220px" }}>
                <BilledTo noMargin />
              </div>

              {hasChecklist && (
                <div
                  style={{
                    flex: "1 1 260px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    background: "#fafafa",
                  }}
                >
                  <h3 style={{ margin: "0 0 2px", fontSize: "0.9rem", fontWeight: "700", color: "#206B3A" }}>Order Summary</h3>
                  {[
                    { label: "Items Ordered", value: itemsOrdered },
                    { label: "Items Packed", value: itemsPacked },
                    { label: "Items Shorted", value: itemsShorted, red: true },
                    { label: "Refunded Items", value: refundedQty, red: true },
                  ].map((s) => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <span style={{ color: "#6b7280" }}>{s.label}</span>
                      <span style={{ fontWeight: "bold", color: s.red ? "#dc2626" : "#206B3A" }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", marginBottom: "1.5rem", fontSize: "0.7rem" }}>
              <thead style={{ backgroundColor: "#206B3A" }}>
                <tr style={{ fontSize: "0.6rem", color: "#ffffff" }}>
                  <th style={{ textAlign: "left", ...cellStyle, width: "29%" }}>Item</th>
                  <th style={{ textAlign: "right", ...cellStyle, width: "6%" }}>ORD</th>
                  <th style={{ textAlign: "right", ...cellStyle, width: "7%" }}>Packed</th>
                  <th style={{ textAlign: "right", ...cellStyle, width: "6%" }}>Unit</th>
                  <th style={{ textAlign: "right", ...cellStyle, width: "8%" }}>Subtotal</th>

                  <th style={{ textAlign: "right", ...cellStyle, width: "8%" }}>Shortage</th>
                  <th style={{ textAlign: "left", ...cellStyle, width: "11%" }}>Reason</th>
                  <th style={{ textAlign: "center", ...cellStyle, width: "10%" }}>Status</th>
                  <th style={{ textAlign: "right", ...cellStyle, width: "7.5%" }}>Tax</th>
                  <th style={{ textAlign: "right", ...cellStyle, width: "7.5%" }}>Refund</th>
                </tr>
              </thead>
              <tbody>
                {nonFrozenItems.map((item, idx) => (
                  <React.Fragment key={`nf-${idx}`}>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <ItemCell item={item} />
                      <td style={{ ...cellStyle, textAlign: "right" }}>{item.qty}</td>
                      <td style={{ ...cellStyle, textAlign: "right" }}>{item?.fullfillQty !== undefined && item?.fullfillQty !== null ? item.fullfillQty : item?.qty}</td>
                      <td style={{ ...cellStyle, textAlign: "right" }}>{item.unit}</td>
                      <td style={{ ...cellStyle, textAlign: "right" }}>
                        ${Number(item?.total) > 0 ? Number(item.total).toFixed(2) : (Number(item.price) * Number(item.qty)).toFixed(2)}
                      </td>
                      <VerificationCells item={item} />
                    </tr>
                    {item?.combo_id?.free_product?.map((fp, i) => {
                      // Checklist result for this specific free product, if the pickup
                      // verification has run — matched by product id since a combo can
                      // grant more than one free product.
                      const freeFulfillment = item?.freeProductFulfillment?.find(
                        (f) => f?.product == fp?.product?._id,
                      );
                      const freeShortage = Number(freeFulfillment?.shortage || 0);
                      // No shortage recorded (or no checklist yet) — assume the free
                      // item was fully packed with the order.
                      const freePacked =
                        freeFulfillment?.fullfillQty !== undefined && freeFulfillment?.fullfillQty !== null
                          ? freeFulfillment.fullfillQty
                          : item?.qty;
                      const freeStatusColor = freeShortage > 0 ? "#dc2626" : "#16a34a";
                      return (
                        <tr key={`fp-${idx}-${i}`} style={{ background: "#f0fdf4" }}>
                          <ItemCell item={fp} freeLabel />
                          <td style={{ ...cellStyle, textAlign: "right" }}>{item.qty}</td>
                          <td style={{ ...cellStyle, textAlign: "right" }}>{freePacked}</td>
                          <td style={{ ...cellStyle, textAlign: "right" }}>{fp?.slot?.unit}</td>
                          <td style={{ ...cellStyle, textAlign: "right" }}>$0.00</td>
                          <td style={{ ...cellStyle, textAlign: "right", color: freeShortage > 0 ? "#dc2626" : undefined }}>
                            {freeShortage}
                          </td>
                          <td style={cellStyle}>{freeFulfillment?.reason || "-"}</td>
                          <td style={{ ...cellStyle, textAlign: "center" }}>
                            <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: freeStatusColor, marginRight: "6px" }} />
                            <span style={{ color: freeStatusColor, fontWeight: 600 }}>{freeShortage > 0 ? "Shortage" : "No Shortage"}</span>
                          </td>
                          <td style={cellStyle}></td>
                          <td style={cellStyle}></td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}

                {frozenItems.length > 0 && (
                  <>
                    <tr>
                      <td colSpan={10} style={{ ...cellStyle, fontWeight: "bold", backgroundColor: "#f9fafb" }}>
                        Frozen Foods
                      </td>
                    </tr>
                    {frozenItems.map((item, idx) => (
                      <tr key={`fr-${idx}`} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <ItemCell item={item} />
                        <td style={{ ...cellStyle, textAlign: "right" }}>{item.qty}</td>
                        <td style={{ ...cellStyle, textAlign: "right" }}>{item?.fullfillQty !== undefined && item?.fullfillQty !== null ? item.fullfillQty : item?.qty}</td>
                        <td style={{ ...cellStyle, textAlign: "right" }}>{item.unit}</td>
                        <td style={{ ...cellStyle, textAlign: "right" }}>
                          ${Number(item?.total) > 0 ? Number(item.total).toFixed(2) : (Number(item.price) * Number(item.qty)).toFixed(2)}
                        </td>
                        <VerificationCells item={item} />
                      </tr>
                    ))}
                  </>
                )}

                <tr style={{ fontWeight: "bold" }}>
                  <td style={cellStyle}>Total</td>
                  <td style={{ ...cellStyle, textAlign: "right" }}>{totalQty}</td>
                  <td style={{ ...cellStyle, textAlign: "right" }}>{itemsPacked}</td>
                  <td style={{ ...cellStyle, textAlign: "right" }}>-</td>
                  <td style={{ ...cellStyle, textAlign: "right" }}>${total}</td>
                  <td style={{ ...cellStyle, textAlign: "right", color: "#dc2626" }}>{itemsShorted}</td>
                  <td style={cellStyle}></td>
                  <td style={cellStyle}></td>
                  <td style={{ ...cellStyle, textAlign: "right" }}>
                    {taxAdjustment > 0 ? `$${taxAdjustment.toFixed(2)}` : "-"}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "right", color: "#dc2626" }}>
                    {totalRefundAmount > 0 ? `$${totalRefundAmount.toFixed(2)}` : "-"}
                  </td>
                </tr>
              </tbody>
            </table>

            {(() => {
              const showRefund = hasChecklist && totalRefundAmount > 0;

              const paymentRows = [];
              if (showRefund) {
                paymentRows.push(
                  { label: "Original Subtotal (Items Ordered)", value: `$${total}` },
                  { label: "Original Tax", value: `$${originalTax.toFixed(2)}` },
                  { label: "Original Order Total (charged)", value: `$${parseFloat(Number(totalAmount)).toFixed(2)}`, bold: true, topBorder: true },
                  { label: `Refund for Shortage (${refundedQty} item${refundedQty > 1 ? "s" : ""})`, value: `- $${productRefundTotal.toFixed(2)}`, muted: true, topBorder: true },
                );
                if (taxAdjustment > 0) {
                  paymentRows.push({ label: "Tax Adjustment (Refund)", value: `- $${taxAdjustment.toFixed(2)}`, muted: true });
                }
                paymentRows.push({ label: "Adjusted Subtotal", value: `$${adjustedSubtotal.toFixed(2)}`, bold: true });
              } else {
                paymentRows.push({ label: "Subtotal", value: `$${total}` });
              }
              paymentRows.push(
                { label: "Discount", value: `$${parseFloat(order.discount || 0).toFixed(2)}` },
                { label: "Delivery tip", value: `$${parseFloat(order.Deliverytip || 0).toFixed(2)}` },
                { label: "Delivery Charges", value: `$${parseFloat(order.deliveryfee || 0).toFixed(2)}` },
                { label: "Service Fee", value: `$${parseFloat(order.serviceFee || 0).toFixed(2)}` },
                { label: "Extended Zone Delivery Fee", value: `$${parseFloat(order.extraFees || 0).toFixed(2)}` },
              );
              if (showRefund && taxAdjustment > 0) {
                paymentRows.push({ label: "Adjusted Tax", value: `$${adjustedTax.toFixed(2)}`, bold: true });
              } else {
                paymentRows.push({ label: "Total Tax", value: `$${originalTax.toFixed(2)}` });
              }

              const PaymentSummaryBox = (
                <div
                  style={{
                    flex: "1 1 280px",
                    border: showRefund ? "1px solid #fbcfe8" : "1px solid #e5e7eb",
                    background: showRefund ? "#fdf2f8" : "transparent",
                    borderRadius: showRefund ? "8px" : 0,
                    padding: showRefund ? "10px 14px" : 0,
                    borderTop: showRefund ? "1px solid #fbcfe8" : "1px solid #e5e7eb",
                    paddingTop: showRefund ? "10px" : "12px",
                  }}
                >
                  {showRefund && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 0 8px" }}>
                      <span style={{ width: "14px", height: "14px", borderRadius: "50%", border: "1.5px solid #be185d", color: "#be185d", fontSize: "10px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>$</span>
                      <h3 style={{ margin: 0, color: "#be185d", fontSize: "0.8rem" }}>Payment Summary (Details)</h3>
                    </div>
                  )}
                  {paymentRows.map((row, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "2px",
                        fontSize: "0.6rem",
                        fontWeight: row.bold ? "600" : "normal",
                        color: row.muted ? "#dc2626" : "inherit",
                        borderTop: row.topBorder ? "1px solid #e5e7eb" : undefined,
                        paddingTop: row.topBorder ? "0.35rem" : undefined,
                        marginTop: row.topBorder ? "0.15rem" : undefined,
                      }}
                    >
                      <span>{row.label}</span>
                      <span style={{ marginLeft: "2rem" }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: "0.35rem", fontSize: "0.85rem", fontWeight: "bold" }}>
                    <span>{showRefund ? "Total Charged" : "Total"}</span>
                    <span style={{ marginLeft: "2rem" }}>
                      ${(showRefund ? totalCharged : parseFloat(Number(totalAmount))).toFixed(2)}
                    </span>
                  </div>
                </div>
              );

              if (!showRefund) {
                return (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ minWidth: "280px" }}>{PaymentSummaryBox}</div>
                  </div>
                );
              }

              return (
                <div style={{ display: "flex", gap: "14px", alignItems: "stretch", flexWrap: "wrap", marginBottom: "1rem" }}>
                  <div
                    style={{
                      flex: "1 1 280px",
                      border: "1px solid #bfdbfe",
                      background: "#eff6ff",
                      borderRadius: "8px",
                      padding: "10px 14px",
                    }}
                  >
                    <h3 style={{ margin: "0 0 2px", color: "#1d4ed8", fontSize: "0.8rem" }}>Refund Summary</h3>
                    <p style={{ fontSize: "0.72rem", color: "#444", margin: "0 0 2px" }}>
                      You have been refunded for items that were unavailable.
                    </p>
                    {[
                      { label: `Product Refund (${refundedQty} item${refundedQty > 1 ? "s" : ""})`, value: `$${productRefundTotal.toFixed(2)}` },
                      { label: "Tax Adjustment (Refund)", value: `$${taxAdjustment.toFixed(2)}` },
                    ].map((row) => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", marginBottom: "2px" }}>
                        <span>{row.label}</span>
                        <span>{row.value}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #bfdbfe", paddingTop: "0.3rem", marginTop: "0.3rem", fontWeight: "bold", fontSize: "0.6rem" }}>
                      <span>Total Refund Amount</span>
                      <span>${totalRefundAmount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", marginTop: "2px" }}>
                      <span>Refund Status</span>
                      <span style={{ fontWeight: "600", color: refundStatus === "Processed" ? "#16a34a" : refundStatus === "Rejected" ? "#dc2626" : "#e67e22" }}>
                        {refundStatus}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", marginTop: "2px" }}>
                      <span>Refund Method</span>
                      <span>Original Payment Method</span>
                    </div>
                    <p style={{ marginTop: "4px", fontSize: "0.6rem", color: "#555", textAlign: "center" }}>
                      Thank you for your understanding. We apologize for any inconvenience caused.
                    </p>
                  </div>

                  {PaymentSummaryBox}
                </div>
              );
            })()}

            {/* Footer */}
            <div style={{ marginTop: "2rem", textAlign: "center", borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
              <p style={{ margin: 0 }}>Thank you for shopping with BACH HOA HOUSTON</p>
              <p style={{ margin: 0, color: "#6b7280" }}>For questions, contact us at contact@bachhoahouston.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
