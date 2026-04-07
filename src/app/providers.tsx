"use client";

import { ToastProvider } from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import type { FC } from "react";
import { cn } from "@/lib/utils";

const Providers: FC<
  Partial<Pick<HTMLElement, "className"> & ThemeProviderProps> & {
    session?: Session | null;
  }
> = ({ children, className, session, ...props }) => {
  return (
    <>
      <ToastProvider />
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        {...props}
      >
        <SessionProvider session={session} refetchOnWindowFocus={false}>
          <I18nProvider locale="vi">
            <main className={cn("relative flex flex-col gap-3")}>
              {children}
            </main>
          </I18nProvider>
        </SessionProvider>
      </NextThemesProvider>
    </>
  );
};

export default Providers;
