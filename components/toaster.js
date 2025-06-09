import Alert from "@mui/material/Alert";

export default function Toaster(props) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert className="bg-[#FFD67E]" severity={props.type}>
        <p className="text-black font-semibold">{props.message}</p>
      </Alert>
    </div>
  );
}

