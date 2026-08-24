"use client";

import * as React from "react";

import { PanelLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function sidebarCookieOpen() {
  return !document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .some((cookie) => cookie === `${SIDEBAR_COOKIE_NAME}=false`);
}

function writeSidebarCookie(open: boolean) {
  document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
}

function applyDesktopSidebarState(open: boolean) {
  const sidebar = document.querySelector<HTMLElement>("[data-docs-sidebar]");
  if (!sidebar) {
    return;
  }
  sidebar.dataset.state = open ? "expanded" : "collapsed";
  sidebar.dataset.collapsible = open ? "" : "icon";
}

export function DocsSidebarRailControl() {
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    const initialOpen = sidebarCookieOpen();
    setOpen(initialOpen);
    applyDesktopSidebarState(initialOpen);
  }, []);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => {
          const next = !current;
          applyDesktopSidebarState(next);
          writeSidebarCookie(next);
          return next;
        });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function toggleSidebar() {
    setOpen((current) => {
      const next = !current;
      applyDesktopSidebarState(next);
      writeSidebarCookie(next);
      return next;
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Toggle Sidebar"
      aria-expanded={open}
      title="Toggle Sidebar"
      onClick={toggleSidebar}
      className="docs-sidebar-rail-control"
    >
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

export function DocsSidebarMobileSheet({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  function onContentClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const link = target.closest("a[href]");
    if (!link) {
      return;
    }
    if (target.closest("[data-docs-project-section-toggle]")) {
      return;
    }
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {/* Labelled: stacked under the site's own hamburger, two bare icons
            gave no clue which one opened the chapter list. */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5"
          aria-label="Open docs navigation"
        >
          <PanelLeftIcon />
          <span className="text-xs font-medium">Chapters</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="docs-sidebar-mobile-sheet-content"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Docs navigation</SheetTitle>
          <SheetDescription>
            Displays the mobile documentation sidebar.
          </SheetDescription>
        </SheetHeader>
        <div
          className="docs-sidebar-mobile-sheet-body"
          onClick={onContentClick}
        >
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
