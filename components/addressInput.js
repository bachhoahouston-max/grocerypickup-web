"use client";
import { useRef, useState, useEffect } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

const GOOGLE_API_KEY = "AIzaSyDHd5FoyP2sDBo0vO2i0Zq7TIUZ_7GhBcI";
const libraries = ["places"];
const AddressInput = ({ profileData, setProfileData, className ,value}) => {
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
      const country = place.address_components?.find((comp) =>
        comp.types.includes("country")
      )?.long_name || "";
      
      setInputValue(formattedAddress);
      
      setProfileData((prev) => ({
        ...prev,
        address: formattedAddress,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      }));
    }
  };
 
  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.trim() === "") {
      setProfileData((prev) => ({
        ...prev,
        address: "",
        lat: "",
        lng: "",
      }));
    }
  };
 
  if (loadError) return <p>Error loading Google Maps: {loadError.message}</p>;
  if (!isLoaded) return <p>Loading...</p>;
 
  return (
    <div>
      <Autocomplete
        onLoad={(autoC) => (autocompleteRef.current = autoC)}
        onPlaceChanged={handlePlaceSelect}
        options={{ types: ['address'] }} 
      >
        <input
          className={className}
          type="text"
          placeholder="Shipping Address"
          value={inputValue}
          onChange={handleChange}
          required
        />
      </Autocomplete>
    </div>
  );
};

export default AddressInput;