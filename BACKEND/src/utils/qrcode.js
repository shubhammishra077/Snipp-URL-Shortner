import QRCode from "qrcode";

export const generateQrCodeDataUrl = async (text, color = "#111827") => {
  return await QRCode.toDataURL(text, {
    width: 320,
    margin: 2,
    color: { dark: color, light: "#FFFFFF" },
  });
};
