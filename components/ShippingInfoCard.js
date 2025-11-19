import { MapPin, Pencil, Plus } from "lucide-react";

export default function ShippingInfoCard({
  localAddress,
  setOpen,
  getProfileData,
}) {
  const hasAddress =
    localAddress?.address ||
    localAddress?.zipcode ||
    localAddress?.ApartmentNo ||
    localAddress?.name;

  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border ">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Shipping Information
      </h2>

      {!hasAddress ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center cursor-pointer gap-2 text-white bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600"
        >
          <Plus size={18} /> Add Address
        </button>
      ) : (
        <div className="flex justify-between items-start">
          {/* Address Details */}
          <div className="text-sm text-gray-700 leading-[1.4]">
            <p className="font-medium text-gray-900">
              {localAddress.name} {localAddress.lastname}
            </p>

            {localAddress.phoneNumber && (
              <p className="text-gray-600">{localAddress.phoneNumber}</p>
            )}

            {localAddress.email && (
              <p className="text-gray-600">{localAddress.email}</p>
            )}

            <div className="flex items-start gap-2 mt-1 md:w-[400px] w-[280px]">
              <MapPin size={18} className="text-gray-500 mt-1" />
              <div>
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
              <p className="mt-1 text-gray-700">
                Company: {localAddress.BusinessAddress}
              </p>
            )}
          </div>

        
          <button
            onClick={() => {
              setOpen(true);
              getProfileData();
            }}
            className="absolute right-10 flex items-center gap-2 cursor-pointer text-custom-green"
          >
            <Pencil size={18} /> Edit
          </button>
        </div>
      )}
    </div>
  );
}
