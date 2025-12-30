import "@/lib/fontawesome.config";
import { hexToRgb } from "@/lib/hexToRgb";
const getThemeFromDB = async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return {
    primaryColor: "#172554",
    secondaryColor: "#4ade80",
  };
};

export default async function HospitalAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getThemeFromDB();

  const primaryColorRgb = hexToRgb(theme.primaryColor);
  const secondaryColorRgb = hexToRgb(theme.secondaryColor);

  return (
    <div
      style={
        {
          "--color-primary": primaryColorRgb,
          "--color-secondary": secondaryColorRgb,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
