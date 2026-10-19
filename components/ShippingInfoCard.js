import { MapPin, Pencil, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ShippingInfoCard({
  localAddress,
  setOpen,
  getProfileData,
}) {
  const { t } = useTranslation();
  const hasAddress =
    localAddress?.address ||
    localAddress?.zipcode ||
    localAddress?.ApartmentNo ||
    localAddress?.name;

  return (
    <div className="bg-white p-3 md:p-4 rounded-xl border-2 border-gray-200">
      <h2 className="text-lg md:text-xl font-bold text-[#1f2a5c] mb-2">
        {t("Shipping Information")}
      </h2>

      {!hasAddress ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center cursor-pointer gap-2 text-white bg-custom-green px-4 py-2 rounded-lg "
        >
          <Plus size={18} /> {t("Add Address")}
        </button>
      ) : (
        <div className="flex justify-between items-start gap-3">
          {/* Address Details */}
          <div className="text-sm md:text-[15px] text-[#1f2a5c] leading-[1.45] min-w-0">
            <p className="text-gray-900">
              {localAddress.name} {localAddress.lastname}
            </p>

            {localAddress.phoneNumber && <p>{localAddress.phoneNumber}</p>}

            {localAddress.email && (
              <p className="break-all">{localAddress.email}</p>
            )}

            <div className="flex items-start gap-2 mt-2">
              <MapPin size={20} className="text-gray-500 mt-0.5 shrink-0" />
              <div className="text-gray-900">
                <p>{localAddress.address}</p>
                {localAddress.ApartmentNo && (
                  <p>Apartment No: {localAddress.ApartmentNo}</p>
                )}
                {localAddress.SecurityGateCode && (
                  <p>Security Code: {localAddress.SecurityGateCode}</p>
                )}
                {localAddress.zipcode && <p>Zipcode: {localAddress.zipcode}</p>}
              </div>
            </div>

            {localAddress.isBusinessAddress && (
              <p className="mt-1">Company: {localAddress.BusinessAddress}</p>
            )}
          </div>

          <button
            onClick={() => {
              setOpen(true);
              getProfileData();
            }}
            className="shrink-0 mt-6 flex items-center gap-1.5 cursor-pointer text-custom-green font-medium"
          >
            <Pencil size={18} /> {t("Edit")}
          </button>
        </div>
      )}
    </div>
  );
}
