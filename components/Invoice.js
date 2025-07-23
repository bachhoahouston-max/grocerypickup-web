import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { MdFileDownload } from "react-icons/md";
import Barcode from "react-barcode";

const Invoice = ({ order }) => {
  const invoiceRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const invoiceId = order?.orderId || order?._id;
  const createdAt = new Date(order?.createdAt || Date.now());

  const formattedDate = `${String(createdAt.getMonth() + 1).padStart(
    2,
    "0"
  )}/${String(createdAt.getDate()).padStart(2, "0")}/${String(
    createdAt.getFullYear()
  ).slice()}`;

  const formattedTime = createdAt.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // Use hour12 to get AM/PM format
  });

  const orderDateTime = `${formattedDate} ${formattedTime}`;

  const website = "www.bachhoahouston.com";

  const orderData = {
    id: invoiceId,
    date: orderDateTime,
    customer: {
      name: order?.Local_address?.name,
      address: order?.Local_address?.address,
      phone: order?.Local_address?.phoneNumber,
    },
    total: order.total,
    items:
      order?.productDetail?.map((item) => ({
        name: item?.product?.name,
        qty: item?.qty || 1,
        price: item?.price || 0,
        tax: item?.tax || 0,
      })) || [],
  };

  const total = orderData.items.reduce((sum, i) => sum + i.price, 0);
  const totalQty = order?.productDetail?.reduce((sum, i) => sum + i.qty, 0);

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
    <div className="">
      <div className="relative inline-block">
        <button
          onClick={downloadInvoice}
          className="inline-flex items-center gap-2 text-gray-700 py-1 px-3 rounded-md cursor-pointer 
                   hover:bg-gray-100 transition-colors duration-200 ease-in-out focus:outline-none 
                   focus:ring-2 focus:ring-gray-300"
          type="button"
          aria-label="Download Invoice"
        >
          <span>Invoice</span>
          <MdFileDownload className="text-xl" />
        </button>
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
            paddingBottom: "5px",
            marginBottom: "5px",
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

        <div
          style={{
            width: "400px", // fixed width
            height: "150px", // fixed height
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // optional: spacing inside
          }}
        >
          <Barcode value={order.orderId} />

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
                colSpan="1"
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
                {totalQty}
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
            alignItems: "flex-start",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "16px",
            paddingLeft: "50%",
            gap: "32px", // spacing between left and right columns
          }}
        >
          {/* Right Side - Totals */}
          <div style={{ flex: 1 }}>
            {[
              { label: "Subtotal", value: `$${total}` },
              {
                label: "Discount",
                value: `$${parseFloat(order.discount || 0).toFixed(2)}`,
              },
              {
                label: "Delivery tip",
                value: `$${parseFloat(order.Deliverytip || 0).toFixed(2)}`,
              },
              {
                label: "Delivery Charges",
                value: `$${parseFloat(order.deliveryfee || 0).toFixed(2)}`,
              },
              {
                label: "Total Tax",
                value: `$${parseFloat(order.totalTax || 0).toFixed(2)}`,
              },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  color: "#000",
                }}
              >
                <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                <span style={{ width: "100px", textAlign: "right" }}>
                  {item.value}
                </span>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "0.5rem",
                fontWeight: "bold",
              }}
            >
              <span style={{ flex: 1, textAlign: "left" }}>Total</span>
              <span style={{ width: "100px", textAlign: "right" }}>
                ${parseFloat(order.total).toFixed(2)}
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
