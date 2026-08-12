import AddressInput from "./addressInput";
import { X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

export default function AddressForm({
  onclose,
  profileData,
  setProfileData,
  onSubmit,
  pincodes,
  optionType,
}) {
  const { t } = useTranslation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      {/* Overlay Background */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
        onClick={onclose}
      ></div>

      {/* Popup Box */}
      <div className="fixed inset-0 flex justify-center items-center z-[9999] p-4 pointer-events-none">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 relative pointer-events-auto animate-fadeIn scale-100">
          {/* Close Button */}
          <X
            className="absolute top-4 right-4 cursor-pointer text-gray-600 hover:text-black"
            size={22}
            onClick={onclose}
          />

          {/* Title */}
          <p className="text-xl font-semibold mb-4 text-gray-800">
            {t("Shipping Information")}
          </p>

          {/* Form */}
          <div className="flex flex-wrap gap-3">
            <div className="w-full md:w-[48%]">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                {t("First Name")}
              </label>
              <input
                type="text"
                name="name"
                placeholder={t("First Name")}
                value={profileData.name || ""}
                onChange={handleInputChange}
                className="border rounded-lg py-2 px-3 text-sm w-full text-black"
              />
            </div>

            <div className="w-full md:w-[48%]">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                {t("Last Name")}
              </label>
              <input
                type="text"
                name="lastname"
                placeholder={t("Last Name")}
                value={profileData.lastname || ""}
                onChange={handleInputChange}
                className="border rounded-lg py-2 px-3 text-sm w-full text-black"
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                {t("Email")}
              </label>
              <input
                type="email"
                name="email"
                placeholder={t("Email")}
                value={profileData.email || ""}
                onChange={handleInputChange}
                className="border rounded-lg py-2 px-3 text-sm w-full text-black"
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                {t("Phone Number")}
              </label>
              <input
                type="text"
                name="phoneNumber"
                placeholder={t("Phone Number")}
                value={profileData.phoneNumber || ""}
                onChange={handleInputChange}
                className="border rounded-lg py-2 px-3 text-sm w-full text-black"
              />
            </div>

            {optionType === "localDelivery" && (
              <div className="w-full">
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  {t("ZIP Code")}
                </label>
                <select
                  name="zipcode"
                  value={profileData.zipcode || ""}
                  onChange={handleInputChange}
                  className="border rounded-lg py-2 px-3 text-sm w-full text-black"
                >
                  <option value="">{t("Select Zipcode")}</option>
                  {pincodes.map((z, idx) => (
                    <option key={idx} value={z.pincode}>
                      {z.pincode}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="w-full">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                {t("Street Address")}
              </label>
              <AddressInput
                setProfileData={setProfileData}
                profileData={profileData}
                value={profileData.address}
                className="border rounded-lg py-2 px-3 text-sm w-full text-black"
                required
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                {t("Apartment / Suite (Optional)")}
              </label>
              <input
                type="text"
                name="ApartmentNo"
                placeholder={t("Apartment #")}
                value={profileData.ApartmentNo || ""}
                onChange={handleInputChange}
                className="border rounded-lg py-2 px-3 text-sm w-full text-black"
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                {t("Security Gate Code (Optional)")}
              </label>
              <input
                type="text"
                name="SecurityGateCode"
                placeholder={t("Security Gate Code")}
                value={profileData.SecurityGateCode || ""}
                onChange={handleInputChange}
                className="border rounded-lg py-2 px-3 text-sm w-full text-black"
              />
            </div>

            <label className="flex items-center gap-2 mt-1 w-full">
              <input
                type="checkbox"
                checked={profileData.isBusinessAddress || false}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    isBusinessAddress: e.target.checked,
                  })
                }
                className="form-checkbox"
              />
              <span className="text-sm text-black">
                {t("This is business address")}
              </span>
            </label>

            <div className="w-full">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                {t("Company Name")}
              </label>
              <input
                type="text"
                name="BusinessAddress"
                placeholder={t("Enter Company Name")}
                value={profileData.BusinessAddress || ""}
                onChange={handleInputChange}
                className="border rounded-lg py-2 px-3 text-sm w-full text-black"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={onSubmit}
            className="bg-custom-green mt-5 w-full text-white py-2 rounded-lg text-sm font-medium transition-all"
          >
            {t("Update Profile")}
          </button>
        </div>
      </div>
    </div>
  );
}
