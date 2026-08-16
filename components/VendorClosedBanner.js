import React from "react";
import { useTranslation } from "react-i18next";
import { AiOutlineWarning } from "react-icons/ai";

/**
 * Shows one dismiss-free banner per distinct closed restaurant vendor
 * represented in `products`. Renders nothing if none of the products on the
 * current page belong to a closed restaurant.
 */
const VendorClosedBanner = ({ products }) => {
  const { t } = useTranslation();

  const closedVendors = [];
  const seen = new Set();
  (products || []).forEach((item) => {
    const vendor = item?.vendor;
    if (vendor?.type === "restaurant" && vendor?.isOpen === false && !seen.has(vendor._id)) {
      seen.add(vendor._id);
      closedVendors.push(vendor);
    }
  });

  if (closedVendors.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-3">
      {closedVendors.map((vendor) => (
        <div
          key={vendor._id}
          className="flex items-start gap-2 bg-orange-50 border border-orange-200 text-orange-800 rounded-[10px] px-4 py-3"
        >
          <AiOutlineWarning className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">
              {t("{{name}} is currently closed", { name: vendor.name })}
            </p>
            <p className="text-xs text-orange-700">{t("Ordering is unavailable right now")}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VendorClosedBanner;
