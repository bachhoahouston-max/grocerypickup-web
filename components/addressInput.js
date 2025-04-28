"use client";
import { useRef, useState, useEffect } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { useTranslation } from "react-i18next";
import { IoSearch } from "react-icons/io5";
const GOOGLE_API_KEY = "AIzaSyDHd5FoyP2sDBo0vO2i0Zq7TIUZ_7GhBcI";
const libraries = ["places"];

const AddressInput = ({ profileData, setProfileData, className ,value}) => {
  const {t} = useTranslation()
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

    console.log(value)
  }, [value]);
 
  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();
    
    if (place && place.geometry) {
      const formattedAddress = place.formatted_address || "Unknown Address";
      const country = place.address_components?.find((comp) =>
        comp.types.includes("country")
      )?.long_name || "";

      console.log(formattedAddress)
      
      setInputValue(formattedAddress);
      
      setProfileData((prev) => ({
        ...prev,
        address: formattedAddress ,
        location: {
          type: 'Point',
          coordinates: [
            place.geometry.location.lng(),
            place.geometry.location.lat()
          ]
        },
      }));
    }
  };
 
  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    console.log(value)
    if (value.trim() === "") {
      setProfileData((prev) => ({
        ...prev,
        address: "",
      }));
    }
  };
 
  if (loadError) return <p>Error loading Google Maps: {loadError.message}</p>;
  if (!isLoaded) return <p>Loading...</p>;

  return (
    <div className="!z-[99999999]">
      <Autocomplete
        onLoad={(autoC) => (autocompleteRef.current = autoC)}
        onPlaceChanged={handlePlaceSelect}
        options={{ types: ['address'] }} 
      >
        <div>
        <input
          className={className}
          type="text"
          placeholder={t("Shipping Address")}
          value={inputValue}
          onChange={handleChange}
          required
        />
        <IoSearch className='absolute md:right-8 right-2 top-[240px] md:top-[150px]'/>
        </div>
      </Autocomplete>
    </div>
  );
};

export default AddressInput;