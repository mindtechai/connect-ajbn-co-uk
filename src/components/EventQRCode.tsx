import { useEffect, useState } from "react";

export function EventQRCode({ token, size = 220 }: { token: string; size?: number }) {
  const [src, setSrc] = useState<string>("");
  useEffect(() => {
    let active = true;
    // Loaded lazily in the browser only: `qrcode` pulls in pngjs, which calls
    // Node's util.inherits at module load and crashes the SSR/edge runtime.
    void import("qrcode").then(({ default: QRCode }) =>
      QRCode.toDataURL(token, { width: size, margin: 1 }).then((url) => {
        if (active) setSrc(url);
      }),
    );
    return () => {
      active = false;
    };
  }, [token, size]);
  if (!src) return <div style={{ width: size, height: size }} className="bg-muted animate-pulse rounded" />;
  return <img src={src} alt="Check-in QR" width={size} height={size} className="rounded" />;
}
