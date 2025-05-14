import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Invoice = ({ order }) => {
  const invoiceRef = useRef(null);

  const invoiceId =
    order?.orderId || order?._id || `INV-${Math.floor(Math.random() * 10000)}`;
  const orderDate =
    new Date(order?.createdAt || Date.now()).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }) +
    " " +
    new Date(order?.createdAt || Date.now()).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  const customerCompleteAddress = `${
    order?.Local_address?.address || "Unknown"
  }, ${order?.Local_address?.city || "Unknown"}, ${
    order?.Local_address?.state || "Unknown"
  }, ${order?.Local_address?.country || "Unknown"} - ${
    order?.Local_address?.pinCode || "111111"
  }`;
  const website =
    window.location.origin || "https://www.tropicanasupermarket.com";

  const orderData = {
    id: invoiceId,
    date: orderDate,
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
      })) || [],
  };

  const total = orderData.items.reduce((sum, i) => sum + i.qty * i.price, 0);

  const downloadInvoice = async () => {
    const input = invoiceRef.current;
    if (!input) return;

    // Wait for rendering just in case
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
      <button
        onClick={downloadInvoice}
        className="h-fit w-fit bg-custom-green text-white text-xs py-1 px-2 rounded cursor-pointer"
      >
        Download Invoice
      </button>

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
              Grocery Pickup Store
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
                Unit Price
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
                <td
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #e5e7eb",
                    textAlign: "right",
                  }}
                >
                  ${item.qty * item.price}
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
              <span style={{marginLeft: "20px"}}>${total}</span>
            </div>
            <div style={{ marginBottom: "0.5rem", textAlign: "right" }}>
              <span style={{ color: "#000" }}>Discount</span>
              <span style={{marginLeft: "20px"}}>${order?.discount ? parseFloat(order.discount) : 0.0}</span>
            </div>
            <div style={{ marginBottom: "0.5rem", textAlign: "right" }}>
              <span style={{ color: "#000" }}>Tax (0%)</span>
              <span style={{marginLeft: "20px"}}>${0.0}</span>
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
              <span style={{marginLeft: "20px"}}>
                ${total - (order?.discount ? parseFloat(order.discount) : 0.0)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p>Thank you for shopping with Grocery Pickup Store</p>
          <p>For queries, contact us at email@addess.com</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
