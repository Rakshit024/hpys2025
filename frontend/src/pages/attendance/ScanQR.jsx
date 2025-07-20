import React, { useEffect, useRef, useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/scanqr.css";
import toast from "react-hot-toast";

function isInAppBrowser() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return (
    /FBAN|FBAV|Instagram|Line|Twitter|Snapchat|WhatsApp|Messenger|LinkedIn|Pinterest|WeChat|MiuiBrowser|VivoBrowser|OPPOBrowser|HeyTapBrowser|DuckDuckGo|SamsungBrowser/i.test(
      ua
    ) && !/Chrome|Safari|Firefox/i.test(ua)
  );
}

const ScanQR = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [data, setData] = useState({});

  const query = new URLSearchParams(location.search);
  const day = query.get("day");
  const session = query.get("session");

  return (
    <>
      <div className="scanqr-container">
        <h2>
          Attendance for <strong>{day}</strong> - <strong>{session}</strong>
        </h2>

        <div id="qr-reader">
          <BarcodeScannerComponent
            width="100%"
            height="100%"
            onUpdate={async (err, result) => {
              if (result && !hasScanned) {
                setHasScanned(true); // ✅ Lock scanner after first scan
                setIsLoading(true);
                try {
                  const res = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/attendance/mark`,
                    {
                      email: result.text,
                      day,
                      session,
                    }
                  );
                  if (res.status === 201) {
                    toast.success("Attendance Successfully Marked");
                    setData(res.data.formetedData);
                  }
                } catch (error) {
                  if (error.response?.status === 409) {
                    toast.error("Attendance Already Marked");
                    setData({})
                  } else {
                    toast.error("Failed to mark attendance");
                  }
                } finally {
                  setIsLoading(false);
                }
              }
            }}
          />
        </div>
        {hasScanned && (
          <button onClick={() => setHasScanned(false)}>Scan Again</button>
        )}

        <button onClick={() => navigate("/attendance")}>Home</button>
      </div>
      <div className="flex items-center justify-center">
        {data.photo_url && (
          <img
            src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${
              data.photo_url
            }`}
            alt="User Image"
            height={100}
            width={100}
          
            className="object-contain w-sm"
           
          />
          )}
      </div>
    </>
  );
};

export default ScanQR;
