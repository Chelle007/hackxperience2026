import type { Metadata } from "next";
import { Bebas_Neue, IBM_Plex_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { AdminShellFrame, AdminShellProvider } from "./components/AdminShell";
import { PortalSettingsProvider } from "./components/PortalSettingsContext";

const adminDisplay = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-admin-display",
});

const adminMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-admin-mono",
});

export const metadata: Metadata = {
  title: "HACKX ADMIN",
  description: "HackXperience 2026 admin submission portal.",
};

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className={`${adminDisplay.variable} ${adminMono.variable} min-h-screen bg-[#0f0f0f] text-[#f5f0e8]`}>
      <PortalSettingsProvider>
        <AdminShellProvider>
          <AdminShellFrame>{children}</AdminShellFrame>
        </AdminShellProvider>
      </PortalSettingsProvider>
    </div>
  );
}
