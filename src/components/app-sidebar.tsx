"use client";

import type * as React from "react";

import { IconGlyph } from "@/components/web/icon-glyph";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { platformDocsByCategory, platformDocsProjects } from "@/lib/protocol";
import { withBasePath } from "@/lib/base-path";
import { cn } from "@/lib/utils";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  activeSlug?: string;
  activeSections?: Array<{
    id: string;
    label: string;
  }>;
};

export function AppSidebar({ activeSlug, activeSections = [], className, ...props }: AppSidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      className={cn("top-0 h-svh", className)}
      {...props}
    >
      <SidebarHeader className="h-11 border-b border-sidebar-border px-2 py-1">
        <div className="flex h-full items-center justify-between gap-2">
          <span className="min-w-0 px-2 text-sm font-medium text-sidebar-foreground group-data-[collapsible=icon]:sr-only">
            Docs
          </span>
          <SidebarTrigger className="size-8 shrink-0" />
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-2 px-2 pb-2 pt-2">
        <SidebarGroup className="p-0">
          <SidebarMenu>
            {platformDocsProjects.categories.map((category) => {
              const projects = platformDocsByCategory(category);
              if (!projects.length) {
                return null;
              }
              const hasActiveProject = projects.some((project) => project.slug === activeSlug);
              return (
                <SidebarMenuItem key={category.slug}>
                  <div
                    className={cn(
                      "flex h-7 items-center gap-1.5 px-2 text-[0.72rem] font-medium leading-4 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden",
                      hasActiveProject && "text-sidebar-foreground"
                    )}
                  >
                    <IconGlyph name={category.icon} className="size-3.5 shrink-0" />
                    <span className="truncate">{category.name}</span>
                  </div>
                  <SidebarMenuSub className="mb-2 ml-1 mr-0 mt-0.5 gap-0 border-l-0 px-0 py-0.5">
                    {projects.map((project) => {
                      const isActiveProject = project.slug === activeSlug;
                      return (
                        <SidebarMenuSubItem key={project.slug}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActiveProject}
                            className="my-px ml-[7px] mr-2 h-[31px] w-[calc(100%-15px)] whitespace-normal px-2 py-1.5 text-[0.85rem] leading-[1.19rem]"
                          >
                            <a href={withBasePath(project.href)}>
                              <span className="whitespace-normal break-words">{project.displayName}</span>
                            </a>
                          </SidebarMenuSubButton>
                          {isActiveProject && activeSections.length > 0 ? (
                            <SidebarMenuSub className="mb-2 ml-3 mr-0 mt-0.5 gap-0 border-l-0 px-0 py-0.5">
                              {activeSections.map((section) => {
                                const [, number, title] = /^(\S+)\s+(.+)$/.exec(section.label) || [];
                                return (
                                  <SidebarMenuSubItem key={section.id}>
                                    <SidebarMenuSubButton
                                      asChild
                                      className="my-px ml-[7px] mr-2 h-auto w-[calc(100%-15px)] items-start gap-2 whitespace-normal px-2 py-1.5 text-[0.82rem] leading-[1.18rem]"
                                    >
                                      <a href={`#${section.id}`}>
                                        {number ? (
                                          <span className="w-4 shrink-0 text-sidebar-foreground/60">{number}</span>
                                        ) : null}
                                        <span className="whitespace-normal break-words">{title || section.label}</span>
                                      </a>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          ) : null}
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
