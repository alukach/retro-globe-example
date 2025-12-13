import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0b0f14] text-neutral-200 font-mono">
        {children}
      </body>
    </html>
  );
}
