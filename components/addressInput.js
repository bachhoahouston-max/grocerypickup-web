"use client";
import { useRef, useState, useEffect } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { useTranslation } from "react-i18next";

const GOOGLE_API_KEY = "AIzaSyDHd5FoyP2sDBo0vO2i0Zq7TIUZ_7GhBcI";
const libraries = ["places"];

const AddressInput = ({ profileData, setProfileData, className, value }) => {
  const { t } = useTranslation();
  const autocompleteRef = useRef(null);
  const [inputValue, setInputValue] = useState(value || "");

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (value) {
      setInputValue(value);
    }
  }, [value]);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();

    if (place && place.geometry) {
      const formattedAddress = place.formatted_address || "Unknown Address";
      const addressComponents = place.address_components || [];

      const city =
        addressComponents.find((comp) => comp.types.includes("locality"))
          ?.long_name || "";

      const state =
        addressComponents.find((comp) =>
          comp.types.includes("administrative_area_level_1")
        )?.long_name || "";

      const country =
        addressComponents.find((comp) => comp.types.includes("country"))
          ?.long_name || "";

      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();

      setInputValue(formattedAddress);

      setProfileData((prev) => ({
        ...prev,
        address: formattedAddress,
        city,
        state,
        country,
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      }));
    }
  };
  useEffect(() => {
    // Optional: If profileData comes late
    if (profileData?.address) {
      setInputValue(profileData.address);
    }
  }, [profileData]);

  const handleAddressChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.trim() === "") {
      setProfileData((prev) => ({
        ...prev,
        address: "",
        city: "",
        state: "",
        country: "",
        location: { type: "Point", coordinates: [0, 0] },
      }));
    }
  };

  const handleCityChange = (e) => {
    const val = e.target.value;
    setProfileData((prev) => ({ ...prev, city: val }));
  };

  const handleStateChange = (e) => {
    const val = e.target.value;
    setProfileData((prev) => ({ ...prev, state: val }));
  };

  if (loadError) return <p>Error loading Google Maps: {loadError.message}</p>;
  if (!isLoaded) return <p>Loading...</p>;

  return (
    <div className="!z-[99999999] space-y-3">
      {/* Address Autocomplete Input */}
      <Autocomplete
        onLoad={(autoC) => (autocompleteRef.current = autoC)}
        onPlaceChanged={handlePlaceSelect}
        options={{ types: ["address"] }}
      >
        <input
          className={className}
          type="text"
          placeholder={t("Shipping Address")}
          value={inputValue}
          onChange={handleAddressChange}
          required
        />
      </Autocomplete>
      <p className="text-[12px] ms-3 -mt-3 mb-1 text-black">
        Select the address to auto-fill City and State.
      </p>

      <input
        className={className}
        type="text"
        placeholder={t("City")}
        value={profileData.city || ""}
        onChange={handleCityChange}
      />

      <input
        className={className}
        type="text"
        placeholder={t("State")}
        value={profileData.state || ""}
        onChange={handleStateChange}
      />
    </div>
  );
};

export default AddressInput;
