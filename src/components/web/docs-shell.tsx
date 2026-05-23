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
  activeSections?: Array<{
    id: string;
    label: string;
  }>;
  children: React.ReactNode;
};

export function DocsShell({ activeSlug, activeSections = [], children }: DocsShellProps) {
  return (
    <SidebarProvider
      className="min-h-svh flex-col"
      style={
        {
          "--sidebar-width": "248px",
          "--sidebar-width-icon": "56px",
        } as React.CSSProperties
      }
    >
      <SiteHeader surface="docs" />
      <div className="flex min-h-0 flex-1">
        <AppSidebar
          activeSlug={activeSlug}
          activeSections={activeSections}
          className="top-14 bottom-auto h-[calc(100svh-3.5rem)]"
        />
        <SidebarInset className="min-w-0 bg-background">
          <div className="sticky top-14 z-30 flex h-11 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:hidden">
            <span className="text-sm font-medium text-foreground">Docs</span>
            <SidebarTrigger className="size-8" />
          </div>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
