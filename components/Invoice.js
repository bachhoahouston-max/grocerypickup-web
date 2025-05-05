import React, { useRef ,useState,useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import contactInfo from "./config/contactInfo";
import constant from "@/services/constant";
import { GoDownload } from "react-icons/go";

const Invoice = ({ order }) => {
  const [invoiceDate, setInvoiceDate] = useState("");

  console.log("order", order);

  const customer = {
    name: "Tanvir Islam",
    address: "Dhaka, Jashore",
    city: "Jashore",
    postalCode: "7420",
  };

  const payment = {
    transactionId: "8a4eb0b8e8",
    amountPaid: 364.0,
    cardType: "NAGAD-Nagad",
    status: "VALID",
    bankTransactionId: "25032714513xgFujK4vGnx8zDD",
    transactionDate: "2025-03-27 01:45:13",
  };

  const subtotal = order.total;
  const tax = 0;
  const total = subtotal + tax;

  useEffect(() => {
    setInvoiceDate(new Date().toLocaleDateString());
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const invoiceElement = document.querySelector(".invoice-box");

    html2canvas(invoiceElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      doc.save(`invoice-${order.orderId || order._id}.pdf`);
    });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full">
        <div className="absolute -top-[9999px] -left-[9999px] font-sans">
        {/* <div className=""> */}
          <div className="invoice-box bg-white p-8 rounded-xl shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
                <p className="text-gray-600">
                  Order ID: {order?.orderId || "N/A"}
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-semibold text-gray-900">
                  Tropicana Supermarket
                </h2>
                <p className="text-gray-600">
                  43-A, Vibhuti Khand, Gomti Nagar, Lucknow, India
                </p>
                <p className="text-gray-600">{contactInfo.email}</p>
              </div>
            </div>

            {/* Billing Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Billed To
                </h3>
                <p className="text-gray-600">
                  {order?.shipping_address?.userName}
                </p>
                <p className="text-gray-600">
                  {order?.shipping_address?.address}
                </p>
                <p className="text-gray-600">
                  City: {order?.shipping_address?.city}
                </p>
                <p className="text-gray-600">
                  Country: {order?.shipping_address?.country}
                </p>
                <p className="text-gray-600">
                  Postal Code: {order?.shipping_address?.pinCode}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Invoice Date: {invoiceDate}</p>
                <p className="text-gray-600">
                  Transaction Date:{" "}
                  {order?.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="text-gray-600">
                  Payment Mode:{" "}
                  <span className="font-medium">{order?.paymentmode}</span>
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 font-semibold text-gray-900">
                      Product Name
                    </th>
                    <th className="py-2 px-4 font-semibold text-gray-900">
                      Qty
                    </th>
                    <th className="py-2 px-4 font-semibold text-gray-900">
                      Unit Price
                    </th>
                    <th className="py-2 px-4 font-semibold text-gray-900 text-right">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order?.productDetail?.map((item, index) => (
                    <tr key={index} className="border-b">
                    <td className="py-2 px-4 text-black">
                      {item?.product?.name}
                    </td>
                    <td className="py-2 px-4 text-black">{item?.qty}</td>
                    <td className="py-2 px-4 text-black"> {constant.currency}{(item?.price)}</td>
                    <td className="py-2 px-4 text-black text-right">{constant.currency}{(item?.qty * item?.price)}</td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-full md:w-1/3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-black">{constant.currency}{(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (0%)</span>
                  <span className="text-black">{constant.currency}{(0.00)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span className="text-gray-600">Total</span>
                  <span className="text-black">{constant.currency}{(total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment Information
              </h3>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600">
                <div>
                  <p>Transaction ID: e732473v464v7624r</p>
                  <p>Amount Paid: {order?.total} BDT</p>
                  <p>Payment Method: {order?.paymentmode}</p>
                </div>
                <div>
                  <p>Bank Transaction ID: 4343242424rewrwe</p>
                  <p>Transaction Date: {order?.createdAt}</p>
                  <p>
                    Payment Status:{" "}
                    <span className="font-medium">Success</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-gray-600">
              <p>Thank you for your purchase!</p>
              <p>
                If you have any questions, contact us at {contactInfo.email}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          
          <button
            onClick={downloadPDF}
            className="h-fit w-fit bg-custom-green text-white text-sm py-1 px-2 rounded"
          >
            D
            {/* <Download className="mr-2 text-custom-green" /> */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;


// import { useRef } from "react";
// import contactInfo from "@/config/contactInfo";
// import currencySign from "@/utils/currencySign";

// export default function Invoice({ order }) {
//   const invoiceRef = useRef();
//   // Sample order data
//   const invoiceId =
//     order?.orderId || order?._id || `INV-${Math.floor(Math.random() * 10000)}`;
//   const orderDate =
//     new Date(order?.createdAt || Date.now()).toLocaleDateString("en-IN", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     }) +
//     " " +
//     new Date(order?.createdAt || Date.now()).toLocaleTimeString("en-IN", {
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     });
//   const customerCompleteAddress = `${
//     order?.shipping_address?.address || "Unknown"
//   }, ${order?.shipping_address?.city || "Unknown"}, ${
//     order?.shipping_address?.state || "Unknown"
//   }, ${order?.shipping_address?.country || "Unknown"} - ${
//     order?.shipping_address?.pinCode || "111111"
//   }`;
//   const website =
//     window.location.origin || "https://www.tropicanasupermarket.com";

//   const orderData = {
//     id: invoiceId,
//     date: orderDate,
//     customer: {
//       name: order?.shipping_address?.userName || "Unknown",
//       address: customerCompleteAddress,
//       phone: order?.shipping_address?.phoneNumber || "+1 1111111111",
//     },
//     items:
//       order?.productDetail?.map((item) => ({
//         name: item?.product?.name || "Unknown",
//         qty: item?.qty || 1,
//         price: item?.price || 0,
//       })) || [],
//   };

//   const total = orderData.items.reduce((sum, i) => sum + i.qty * i.price, 0);

//   const downloadInvoice = async () => {
//     if (typeof window === 'undefined') return;
//     const html2pdf = (await import('html2pdf.js')).default;
//     const element = invoiceRef.current;
//     const opt = {
//       margin: 0.5,
//       filename: `Invoice-${order?.orderId}.pdf`,
//       image: { type: "jpeg", quality: 0.98 },
//       html2canvas: { scale: 2 },
//       jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
//     };
//     html2pdf().set(opt).from(element).save();
//   };

//   return (
//     <div className="p-8 bg-gray-50 min-h-screen">
//       <button
//         onClick={downloadInvoice}
//         className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow-md mb-6"
//       >
//         Download Invoice
//       </button>


//       <div
//         ref={invoiceRef}
//         className="bg-white p-8 rounded shadow max-w-3xl mx-auto text-black font-sans"
//         style={{
//           // position: "absolute",
//           top: 0,
//           left: 0,
//           opacity: 1,
//           pointerEvents: "none",
//           zIndex: 1,
//         }}
//       >
//         <div className="flex justify-between items-center border-b pb-4 mb-4">
//           <div>
//             <h1 className="text-2xl font-bold text-custom-green">
//               Tropicana Supermarket
//             </h1>
//             <p className="text-sm">{website}</p>
//           </div>
//           <div className="text-right">
//             <p className="text-sm">
//               Invoice #: <strong>{orderData.id}</strong>
//             </p>
//             <p className="text-sm">Date: {orderData.date}</p>
//           </div>
//         </div>

//         <div className="mb-6 grid">
//           <h2 className="font-semibold text-lg mb-1">Billed To:</h2>
//           <span>{orderData.customer.name}</span>
//           <span>{orderData.customer.address}</span>
//           <span>{orderData.customer.phone}</span>
//         </div>

//         <table className="w-full border-collapse mb-6">
//           <thead className="bg-gray-100 border">
//             <tr>
//               <th className="text-left p-2 border">Item</th>
//               <th className="text-right p-2 border">Qty</th>
//               <th className="text-right p-2 border">Unit Price</th>
//               <th className="text-right p-2 border">Subtotal</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orderData.items.map((item, idx) => (
//               <tr key={idx} className="border-t">
//                 <td className="p-2 border">{item.name}</td>
//                 <td className="p-2 text-right border">{item.qty}</td>
//                 <td className="p-2 text-right border">{currencySign(item.price)}</td>
//                 <td className="p-2 text-right border">
//                  {currencySign(item.qty * item.price)}
//                 </td>
//               </tr>
//             ))}
//             <tr className="border-t font-semibold">
//               <td className="p-2 border" colSpan="3">
//                 Total
//               </td>
//               <td className="p-2 text-right border">{currencySign(total)}</td>
//             </tr>
//           </tbody>
//         </table>

//         <div className="mt-4 flex justify-end">
//           <div className="w-full md:w-1/3">
//             <div className="space-y-1">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Subtotal</span>
//                 <span>{currencySign(total)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Discount</span>
//                 <span>
//                   {currencySign(order?.discount ? parseFloat(order.discount) : 0.0)}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Tax (0%)</span>
//                 <span>
//                   {currencySign(0.0)}
//                 </span>
//               </div>
//               <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-4">
//                 <span>Total</span>
//                 <span>
//                   {currencySign(
//                     total - (order?.discount ? parseFloat(order.discount) : 0.0)
//                   )}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="text-sm text-center text-gray-600 pt-4">
//           <p>Thank you for shopping with Tropicana Supermarket</p>
//           <p>For queries, contact us at {contactInfo?.email}</p>
//         </div>
//       </div>
//     </div>
//   );
// }









// import React, { useRef } from "react";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import contactInfo from "./config/contactInfo";
// import constant from "@/services/constant";
// import { GoDownload } from "react-icons/go";

// const Invoice = ({ order }) => {
//   const invoiceRef = useRef(null);

//   const invoiceId =
//   order?.orderId || order?._id || `INV-${Math.floor(Math.random() * 10000)}`;
// const orderDate =
//   new Date(order?.createdAt || Date.now()).toLocaleDateString("en-IN", {
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   }) +
//   " " +
//   new Date(order?.createdAt || Date.now()).toLocaleTimeString("en-IN", {
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   });
// const customerCompleteAddress = `${
//   order?.shipping_address?.address || "Unknown"
// }, ${order?.shipping_address?.city || "Unknown"}, ${
//   order?.shipping_address?.state || "Unknown"
// }, ${order?.shipping_address?.country || "Unknown"} - ${
//   order?.shipping_address?.pinCode || "111111"
// }`;
// const website =
//   window.location.origin || "https://www.bachhoahouston.com/";

// const orderData = {
//   id: invoiceId,
//   date: orderDate,
//   customer: {
//     name: order?.shipping_address?.userName || "Unknown",
//     address: customerCompleteAddress,
//     phone: order?.shipping_address?.phoneNumber || "+1 1111111111",
//   },
//   items:
//     order?.productDetail?.map((item) => ({
//       name: item?.product?.name || "Unknown",
//       qty: item?.qty || 1,
//       price: item?.price || 0,
//     })) || [],
// };

// const total = orderData.items.reduce((sum, i) => sum + i.qty * i.price, 0);

//   const downloadInvoice = async () => {
//     const input = invoiceRef.current;
//     if (!input) return;

//     await new Promise((res) => setTimeout(res, 500));

//     const canvas = await html2canvas(input, {
//       scale: 2,
//       useCORS: true,
//     });

//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("p", "mm", "a4");

//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

//     pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//     pdf.save(`Invoice-${order?.orderId}.pdf`);
//   };

//   return (
//     <div className="bg-gray-50">
//       <button
//         onClick={downloadInvoice}
//         className="h-fit w-fit text-black text-[22px] py-1 px-2 cursor-pointer"
//       >
//         <GoDownload />
//       </button>

//       {/* Hidden off-screen invoice */}
//       <div
//         ref={invoiceRef}
//         style={{
//           position: "absolute",
//           top: "-9999px",
//           left: "-9999px",
//           width: "800px",
//           background: "white",
//           padding: "40px",
//         }}
//         className="text-black font-sans"
//       >
//         <div className="flex justify-between items-center border-b pb-4 mb-4">
//           <div>
//             <h1 className="text-2xl font-bold text-green-600">
//              Bach Hoa Houston
//             </h1>
//             <p className="text-sm">{website}</p>
//           </div>
//           <div className="text-right">
//             <p className="text-sm">
//               Order ID #: <strong>{orderData.id}</strong>
//             </p>
//             <p className="text-sm">Date: {orderData.date}</p>
//           </div>
//         </div>

//         <div className="mb-6 grid">
//           <h2 className="font-semibold text-lg mb-1">Billed To:</h2>
//           <span>{orderData.customer.name}</span>
//           <span>{orderData.customer.address}</span>
//           <span>{orderData.customer.phone}</span>
//         </div>

//         <table className="w-full border-collapse mb-6 text-sm">
//           <thead className="bg-gray-100 border">
//             <tr>
//               <th className="text-left p-2 border">Item</th>
//               <th className="text-right p-2 border">Qty</th>
//               <th className="text-right p-2 border">Unit Price</th>
//               <th className="text-right p-2 border">Subtotal</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orderData.items.map((item, idx) => (
//               <tr key={idx} className="border-t">
//                 <td className="p-2 border">{item.name}</td>
//                 <td className="p-2 text-right border">{item.qty}</td>
//                 <td className="p-2 text-right border"> {constant.currency}{(item.price)}</td>
//                 <td className="p-2 text-right border">
//                 {constant.currency}{(item.qty * item.price)}
//                 </td>
//               </tr>
//             ))}
//             <tr className="border-t font-semibold">
//               <td className="p-2 border" colSpan="3">
//                 Total
//               </td>
//               <td className="p-2 text-right border">{constant.currency}{(total)}</td>
//             </tr>
//           </tbody>
//         </table>

//         <div className="mt-6 flex justify-end">
//           <div className="w-full md:w-1/3 space-y-1">
//             <div className="flex justify-between">
//               <span className="text-gray-600">Subtotal</span>
//               <span>{constant.currency}{(total)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Discount</span>
//               <span>
//               {constant.currency}{(order?.discount ? parseFloat(order.discount) : 0.0)}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Tax (0%)</span>
//               <span>{constant.currency}{(0.0)}</span>
//             </div>
//             <div className="flex justify-between font-semibold text-lg border-t pt-2">
//               <span>Total</span>
//               <span>
//               {constant.currency}{(
//                   total - (order?.discount ? parseFloat(order.discount) : 0.0)
//                 )}
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="text-sm text-center text-gray-600 border-t pt-4 mt-4">
//           <p>Thank you for shopping with Bach Hoa Houston</p>
//           <p>For queries, contact us at {contactInfo?.email}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Invoice;
