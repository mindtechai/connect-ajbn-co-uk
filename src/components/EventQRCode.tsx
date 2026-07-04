import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function EventQRCode({ token, size = 220 }: { token: string; size?: number }) {
  const [src, setSrc] = useState<string>("");
  useEffect(() => {
    QRCode.toDataURL(token, { width: size, margin: 1 }).then(setSrc);
  }, [token, size]);
  if (!src) return <div style={{ width: size, height: size }} className="bg-muted animate-pulse rounded" />;
  return <img src={src} alt="Check-in QR" width={size} height={size} className="rounded" />;
}