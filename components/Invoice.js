import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { MdFileDownload } from "react-icons/md"

const Invoice = ({ order }) => {
  const invoiceRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);


  const invoiceId =
    order?.orderId || order?._id;
     const createdAt = new Date(order?.createdAt || Date.now());

  // Format date as MM/DD/YY
   const formattedDate = `${String(createdAt.getMonth() + 1).padStart(2, '0')}/${String(createdAt.getDate()).padStart(2, '0')}/${String(createdAt.getFullYear()).slice()}`;

  // Format time as HH:MM:SS AM/PM
  const formattedTime = createdAt.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // Use hour12 to get AM/PM format
  });

  // Final combined format
  const orderDateTime = `${formattedDate} ${formattedTime}`;

  // const customerCompleteAddress = `${
  //   order?.Local_address?.address || "Unknown"
  // }, ${order?.Local_address?.city || "Unknown"}, ${
  //   order?.Local_address?.state || "Unknown"
  // }, ${order?.Local_address?.country || "Unknown"} - ${
  //   order?.Local_address?.pinCode || "111111"
  // }`;

  const website =
    window.location.origin || "https://www.bachhoahouston.com";

  const orderData = {
    id: invoiceId,
    date: orderDateTime,
    customer: {
      name: order?.Local_address?.name || "Unknown",
      address: order?.Local_address?.address || "Unknown",
      phone: order?.Local_address?.phoneNumber || "+1 1111111111",
    },
    items:
      order?.productDetail?.map((item) => ({
        name: item?.product?.name || "Unknown",
        qty: item?.qty || 1,
        price: item?.price || 0,
        tax: item?.tax || 0,
      })) || [],
  };

  const total = orderData.items.reduce((sum, i) => sum + i.price, 0);

  const downloadInvoice = async () => {
    const input = invoiceRef.current;
    if (!input) return;

    await new Promise((res) => setTimeout(res, 500));

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice-${order?.orderId}.pdf`);
  };

  return (
    <div className="bg-gray-50">
      <div className="relative inline-block">
        <button
          onClick={downloadInvoice}
          className="h-fit w-fit text-gray-700 py-1 px-2 rounded cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <MdFileDownload className="text-xl" />
        </button>

        {showTooltip && (
          <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2.5 py-2 rounded shadow-lg z-10 w-[115px]">
            Download Invoice
          </div>
        )}
      </div>

      {/* Hidden off-screen invoice */}
      <div
        ref={invoiceRef}
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "800px",
          background: "white",
          padding: "40px",
          color: "black",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            display: "flex",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "16px",
            marginBottom: "16px",
          }}
        >
          <div>
            <h1
              style={{ fontSize: "2rem", fontWeight: "bold", color: "#f38529" }}
            >
              BACH HOA HOUSTON
            </h1>
            <p style={{ fontSize: "0.875rem" }}>{website}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.875rem" }}>
              Order ID #: <strong>{orderData.id}</strong>
            </p>
            <p style={{ fontSize: "0.875rem" }}>Date: {orderData.date}</p>
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem", display: "grid" }}>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              marginBottom: "0.25rem",
            }}
          >
            Billed To:
          </h2>
          <span>{orderData.customer.name}</span>
          <span>{orderData.customer.address}</span>
          <span>{orderData.customer.phone}</span>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
          }}
        >
          <thead
            style={{
              backgroundColor: "#f3f4f6",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "0.5rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                Item
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "0.5rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "0.5rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                Tax
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "0.5rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {orderData.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #e5e7eb",
                    textAlign: "left",
                  }}
                >
                  {item.name}
                </td>
                <td
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #e5e7eb",
                    textAlign: "right",
                  }}
                >
                  {item.qty}
                </td>
                <td
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #e5e7eb",
                    textAlign: "right",
                  }}
                >
                  ${item.tax}
                </td>
                <td
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #e5e7eb",
                    textAlign: "right",
                  }}
                >
                  ${item.price}
                </td>
              </tr>
            ))}
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td
                style={{
                  padding: "0.5rem",
                  border: "1px solid #e5e7eb",
                  textAlign: "left",
                }}
                colSpan="3"
              >
                Total
              </td>
              <td
                style={{
                  padding: "0.5rem",
                  border: "1px solid #e5e7eb",
                  textAlign: "right",
                }}
                colSpan="1"
              >
                ${total}
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "16px",
          }}
        >
          <div style={{ width: "50%", marginLeft: "50%" }}>
            <div style={{ marginBottom: "0.5rem", textAlign: "right" }}>
              <span style={{ color: "#000" }}>Subtotal</span>
              <span style={{ marginLeft: "50px" }}>${total}</span>
            </div>
            <div style={{ marginBottom: "0.5rem", textAlign: "right" }}>
              <span style={{ color: "#000" }}>Discount</span>
              <span style={{ marginLeft: "50px" }}>${order?.discount ? parseFloat(order.discount) : 0.0}</span>
            </div>
            <div style={{ marginBottom: "0.5rem", textAlign: "right" }}>
              <span style={{ color: "#000" }}>Tax (0%)</span>
              <span style={{ marginLeft: "50px" }}>${0.0}</span>
            </div>
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                paddingTop: "0.5rem",
                fontWeight: "bold",
                alignItems: "center",
                textAlign: "right",
              }}
            >
              <span>Total</span>
              <span style={{ marginLeft: "50px" }}>
                ${total - (order?.discount ? parseFloat(order.discount) : 0.0)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p>Thank you for shopping with BACH HOA HOUSTON</p>
          <p>For queries, contact us at contact@bachhoahouston.com</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
