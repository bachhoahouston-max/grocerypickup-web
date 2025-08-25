"use client";
import { Toaster as SonnerToaster, toast } from "sonner";

export default function Toaster(props) {
  // agar props aaye (type + message), toh ek toast fire kar do
  if (props?.message) {
    if (props.type === "error") {
      toast.error(props.message);
    } else if (props.type === "success") {
      toast.success(props.message);
    } else {
      toast(props.message);
    }
  }

  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
    />
  );
}
