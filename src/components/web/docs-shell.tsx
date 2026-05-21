"use client";

import type * as React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/web/site-header";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type DocsShellProps = {
  activeSlug?: string;
  children: React.ReactNode;
};

export function DocsShell({ activeSlug, children }: DocsShellProps) {
  return (
    <SidebarProvider
      className="min-h-svh"
      style={
        {
          "--sidebar-width": "248px",
          "--sidebar-width-icon": "56px",
        } as React.CSSProperties
      }
    >
      <AppSidebar activeSlug={activeSlug} />
      <SidebarInset className="min-w-0 bg-background">
        <SiteHeader surface="docs" hideBrand />
        <div className="sticky top-16 z-30 flex h-11 items-center border-b bg-background/95 px-4 backdrop-blur md:hidden">
          <SidebarTrigger className="size-8" />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
