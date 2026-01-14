"use client";

import { AppSidebar } from "./AppSidebar";
import { useTranslations } from "next-intl";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const t = useTranslations("HomePage");
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <h1>{t("title")}</h1>
        {children}
      </main>
    </div>
  );
}
