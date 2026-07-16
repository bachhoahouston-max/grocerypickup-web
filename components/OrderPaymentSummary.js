import { useTranslation } from "react-i18next";

const Row = ({ label, value, bold, muted, topBorder }) => (
  <div
    className={`flex justify-between text-sm ${bold ? "font-semibold text-gray-900" : "text-gray-700"} ${muted ? "text-red-600" : ""} ${topBorder ? "border-t border-gray-200 pt-1.5 mt-1.5" : ""}`}
  >
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

// The pink Payment Summary box always renders — it's the order's payment
// history and should be visible regardless of refund state. The blue Refund
// Summary box (and the "adjusted" figures inside Payment Summary) only join
// it once an item actually carries a refund, mirroring Invoice.js's
// showRefund branch so the web page and the downloadable invoice agree.
const OrderPaymentSummary = ({ order, productItem, totalAmount }) => {
  const { t } = useTranslation();
  const items = productItem || [];

  const total = parseFloat(
    items.reduce((sum, i) => sum + Number(i?.total || 0), 0).toFixed(2),
  );

  const refundedItems = items.filter((i) => Number(i?.refundAmount) > 0);
  const showRefund = refundedItems.length > 0;

  const refundedQty = refundedItems.reduce((sum, i) => sum + Number(i?.shortage || 0), 0);
  const taxAdjustment = parseFloat(
    refundedItems.reduce((sum, i) => sum + Number(i?.taxAmount || 0), 0).toFixed(2),
  );
  const totalRefundAmount = parseFloat(
    refundedItems.reduce((sum, i) => sum + Number(i?.refundAmount || 0), 0).toFixed(2),
  );
  const productRefundTotal = parseFloat((totalRefundAmount - taxAdjustment).toFixed(2));
  const originalTax = Number(order?.totalTax || 0);
  const adjustedSubtotal = parseFloat((total - productRefundTotal).toFixed(2));
  const adjustedTax = parseFloat((originalTax - taxAdjustment).toFixed(2));
  const totalCharged = parseFloat((Number(totalAmount) - totalRefundAmount).toFixed(2));

  const refundStatuses = refundedItems.map((i) => i?.refund_status || "Pending");
  const refundStatus = refundStatuses.every((s) => s === "Processed")
    ? "Processed"
    : refundStatuses.every((s) => s === "Rejected")
      ? "Rejected"
      : "Pending";
  const statusColor =
    refundStatus === "Processed"
      ? "text-green-600"
      : refundStatus === "Rejected"
        ? "text-red-600"
        : "text-amber-600";

  const paymentRows = [];
  if (showRefund) {
    paymentRows.push(
      { label: t("Original Subtotal (Items Ordered)"), value: `$${total.toFixed(2)}` },
      { label: t("Original Tax"), value: `$${originalTax.toFixed(2)}` },
      {
        label: t("Original Order Total (charged)"),
        value: `$${Number(totalAmount).toFixed(2)}`,
        bold: true,
        topBorder: true,
      },
      {
        label: `${t("Refund for Shortage")} (${refundedQty} ${t("item")}${refundedQty > 1 ? "s" : ""})`,
        value: `- $${productRefundTotal.toFixed(2)}`,
        muted: true,
        topBorder: true,
      },
    );
    if (taxAdjustment > 0) {
      paymentRows.push({ label: t("Tax Adjustment (Refund)"), value: `- $${taxAdjustment.toFixed(2)}`, muted: true });
    }
    paymentRows.push({ label: t("Adjusted Subtotal"), value: `$${adjustedSubtotal.toFixed(2)}`, bold: true });
  } else {
    paymentRows.push({ label: t("Subtotal"), value: `$${total.toFixed(2)}` });
  }
  paymentRows.push(
    { label: t("Discount"), value: `$${parseFloat(order?.discount || 0).toFixed(2)}` },
    { label: t("Delivery tip"), value: `$${parseFloat(order?.Deliverytip || 0).toFixed(2)}` },
    { label: t("Delivery Charges"), value: `$${parseFloat(order?.deliveryfee || 0).toFixed(2)}` },
    { label: t("Service Fee"), value: `$${parseFloat(order?.serviceFee || 0).toFixed(2)}` },
    { label: t("Extended Zone Delivery Fee"), value: `$${parseFloat(order?.extraFees || 0).toFixed(2)}` },
  );
  if (showRefund && taxAdjustment > 0) {
    paymentRows.push({ label: t("Adjusted Tax"), value: `$${adjustedTax.toFixed(2)}`, bold: true });
  } else {
    paymentRows.push({ label: t("Total Tax"), value: `$${originalTax.toFixed(2)}` });
  }

  return (
    <div className={`grid grid-cols-1 ${showRefund ? "md:grid-cols-2" : ""} gap-3 items-stretch`}>
      {showRefund && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-blue-700 font-semibold text-sm mb-1">{t("Refund Summary")}</h3>
          <p className="text-xs text-gray-600 mb-2">
            {t("You have been refunded for items that were unavailable.")}
          </p>
          <div className="space-y-1">
            <Row
              label={`${t("Product Refund")} (${refundedQty} ${t("item")}${refundedQty > 1 ? "s" : ""})`}
              value={`$${productRefundTotal.toFixed(2)}`}
            />
            <Row label={t("Tax Adjustment (Refund)")} value={`$${taxAdjustment.toFixed(2)}`} />
          </div>
          <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-blue-200 mt-2 pt-2">
            <span>{t("Total Refund Amount")}</span>
            <span>${totalRefundAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-700">{t("Refund Status")}</span>
            <span className={`font-semibold ${statusColor}`}>{t(refundStatus)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1 text-gray-700">
            <span>{t("Refund Method")}</span>
            <span>{t("Original Payment Method")}</span>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            {t("Thank you for your understanding. We apologize for any inconvenience caused.")}
          </p>
        </div>
      )}

      <div className={`rounded-xl border border-pink-200 bg-pink-50 p-4 ${showRefund ? "" : "max-w-md md:ml-auto w-full"}`}>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-4 h-4 rounded-full border border-pink-600 text-pink-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
            $
          </span>
          <h3 className="text-pink-700 font-semibold text-sm">{t("Payment Summary (Details)")}</h3>
        </div>
        <div className="space-y-1">
          {paymentRows.map((row, i) => (
            <Row key={i} {...row} />
          ))}
        </div>
        <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-300 mt-2 pt-2">
          <span>{showRefund ? t("Total Charged") : t("Total")}</span>
          <span>${(showRefund ? totalCharged : Number(totalAmount || 0)).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderPaymentSummary;
