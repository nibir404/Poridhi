import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/motion/SmoothScroll";

const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#FFFFFF" };

export const metadata: Metadata = {
  title: "Poridhi — Learn cloud, DevOps and AI engineering in real lab machines",
  description:
    "Every guide is free. Pro adds real Linux VMs, AI interviews and AI exams. Earn certificates and coins you can redeem for lab time.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("pd-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}` }} /></head>
      <body className={mono.variable} suppressHydrationWarning>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
