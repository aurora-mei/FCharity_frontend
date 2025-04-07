import React, { useState, useEffect } from "react";
import { usePayOS } from "@payos/payos-checkout";
import { APIPrivate } from "../../config/API/api";
import { useNavigate } from "react-router-dom";
const ProductDisplay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isCreatingLink, setIsCreatingLink] = useState(false);
    const navigate = useNavigate();
  const [payOSConfig, setPayOSConfig] = useState({
    RETURN_URL: window.location.href, // required
    ELEMENT_ID: "embedded-payment-container", // required
    CHECKOUT_URL: null, // required
    embedded: true, // Nếu dùng giao diện nhúng
    onSuccess: (event) => {
      //TODO: Hành động sau khi người dùng thanh toán đơn hàng thành công
      setIsOpen(false);
      setMessage("Thanh toan thanh cong");
    },
  });
  const storedUser = localStorage.getItem("currentUser");
  let currentUser = {};

  try {
      currentUser = storedUser ? JSON.parse(storedUser) : {};
  } catch (error) {
      console.error("Error parsing currentUser from localStorage:", error);
  }
  const { open, exit } = usePayOS(payOSConfig);

  const handleGetPaymentLink = async () => {
    setIsCreatingLink(true);
    exit();
    const response = await APIPrivate.post(
      "http://localhost:8080/payment/create",
       {
            amount: 2000,
            itemContent:"tesst",
            paymentContent: "tesst p",
            userId: currentUser.id,
      }
    );
    if (!response) {
        console.log(response)
      console.log("Server doesn't response");
    }
    console.log(response)
    const result = await response.data;
   window.location.href = result;
    setPayOSConfig((oldConfig) => ({
      ...oldConfig,
      CHECKOUT_URL: result,
    }));

    setIsOpen(true);
    setIsCreatingLink(false);
  };

  useEffect(() => {
    if (payOSConfig.CHECKOUT_URL != null) {
      open();
    }
  }, [payOSConfig]);
  return message ? (
    <Message message={message} />
  ) : (
    <div className="main-box">
      <div>
        <div className="checkout">
          <div className="product">
            <p>
              <strong>Tên sản phẩm:</strong> Mì tôm Hảo Hảo ly
            </p>
            <p>
              <strong>Giá tiền:</strong> 2000 VNĐ
            </p>
            <p>
              <strong>Số lượng:</strong> 1
            </p>
          </div>
          <div className="flex">
            {!isOpen ? (
              <div>
                {isCreatingLink ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "10px",
                      fontWeight: "600",
                    }}
                  >
                    Creating Link...
                  </div>
                ) : (
                  <button
                    id="create-payment-link-btn"
                    onClick={(event) => {
                      event.preventDefault();
                      handleGetPaymentLink();
                    }}
                  >
                    Tạo Link thanh toán Embedded
                  </button>
                )}
              </div>
            ) : (
              <button
                style={{
                  backgroundColor: "gray",
                  color: "white",
                  width: "100%",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  fontSize: "14px",
                  marginTop: "5px",
                }}
                onClick={(event) => {
                  event.preventDefault();
                  setIsOpen(false);
                  exit();
                }}
              >
                Đóng Link
              </button>
            )}
          </div>
        </div>
        {isOpen && (
          <div style={{ maxWidth: "400px", padding: "2px" }}>
            Sau khi thực hiện thanh toán thành công, vui lòng đợi từ 5 - 10s để
            hệ thống tự động cập nhật.
          </div>
        )}
        <div
          id="embedded-payment-container"
          style={{
            height: "350px",
          }}
        ></div>
      </div>
    </div>
  );
};

const Message = ({ message }) => (
  <div className="main-box">
    <div className="checkout">
      <div class="product" style={{ textAlign: "center", fontWeight: "500" }}>
        <p>{message}</p>
      </div>
      <form action="/">
        <button type="submit" id="create-payment-link-btn">
          Quay lại trang thanh toán
        </button>
      </form>
    </div>
  </div>
);

export default ProductDisplay;