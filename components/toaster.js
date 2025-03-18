import Alert from "@mui/material/Alert";

export default function Toaster(props) {
  return (
    <Alert className="bg-[#FFD67E]" severity={props.type}>
      <p className="text-black font-semibold"> {props.message}</p>
    </Alert>
  );
}
