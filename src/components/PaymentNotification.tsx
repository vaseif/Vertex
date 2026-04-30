import { useEffect, useState } from "react";

const TOTAL_DAYS = 28;

export default function PaymentNotification() {
  const [visible, setVisible] = useState(false);
  const [daysLeft, setDaysLeft] = useState(TOTAL_DAYS);

  useEffect(() => {
    let startDate = localStorage.getItem("payment_start");

    if (!startDate) {
      const now = new Date();
      localStorage.setItem("payment_start", now.toISOString());
      startDate = now.toISOString();
    }

    const start = new Date(startDate);
    const now = new Date();

    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const remaining = TOTAL_DAYS - diffDays;
    setDaysLeft(remaining > 0 ? remaining : 0);

    // يظهر بعد 4 ثواني
    const timer = setTimeout(() => {
      setVisible(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible || daysLeft <= 0) return null;

  return (
    <div style={styles.container}>
      <span>
        {daysLeft} Complete your payment to avoid any service interruption
      </span>
      <button onClick={() => setVisible(false)} style={styles.close}>
        ✖
      </button>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed" as const,
    bottom: "20px",
    right: "20px",
    background: "#111",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    zIndex: 9999,
  },
  close: {
    background: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },
};