"use client";

import type * as React from "react";
import { ChevronRight } from "lucide-react";

import { IconGlyph } from "@/components/web/icon-glyph";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { platformDocsByCategory, platformDocsProjects } from "@/lib/protocol";
import { cn } from "@/lib/utils";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  activeSlug?: string;
};

export function AppSidebar({ activeSlug, className, ...props }: AppSidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      className={cn("top-0 h-svh", className)}
      {...props}
    >
      <SidebarHeader className="relative h-16 border-b border-sidebar-border p-2">
        <SidebarMenu className="group-data-[collapsible=icon]:hidden">
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="Micronaut Platform Docs"
              className="h-12 p-2 pr-10"
            >
              <a href="/docs/" aria-label="Micronaut Platform Docs">
                <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <img
                    src="/micronaut-assets/icons/micronaut-sally.svg"
                    alt=""
                    aria-hidden="true"
                    className="size-5 object-contain"
                  />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5 leading-none">
                  <span className="truncate font-medium">Micronaut</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">Platform Docs</span>
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="absolute right-2 top-4">
          <SidebarTrigger className="size-8" />
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-2 px-2 pb-2 pt-0">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="h-8 px-2 py-1 text-[0.72rem] leading-4">
            Projects
          </SidebarGroupLabel>
          <SidebarMenu>
            {platformDocsProjects.categories.map((category) => {
              const projects = platformDocsByCategory(category);
              if (!projects.length) {
                return null;
              }
              const hasActiveProject = projects.some((project) => project.slug === activeSlug);
              return (
                <SidebarMenuItem key={category.slug}>
                  <SidebarMenuButton
                    asChild
                    isActive={hasActiveProject}
                    className="h-auto items-start gap-2 py-2 pr-8 font-normal group-data-[collapsible=icon]:items-center"
                    tooltip={category.name}
                  >
                    <a href={`/docs/#${category.slug}`}>
                      <IconGlyph name={category.icon} className="mt-0.5 size-4 shrink-0 group-data-[collapsible=icon]:mt-0" />
                      <span className="whitespace-normal break-words leading-5">{category.name}</span>
                    </a>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    type="button"
                    aria-label={`${category.name} sections`}
                    title={`${category.name} sections`}
                    className="top-2.5 pointer-events-none group-data-[collapsible=icon]:hidden"
                  >
                    <ChevronRight className="size-4 rotate-90" />
                  </SidebarMenuAction>
                  <SidebarMenuSub className="mb-2 ml-1 mr-0 mt-0.5 gap-0 px-0 py-0.5">
                    {projects.map((project) => (
                      <SidebarMenuSubItem key={project.slug}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={project.slug === activeSlug}
                          className="my-px ml-[7px] mr-2 h-[31px] w-[calc(100%-15px)] whitespace-normal px-2 py-1.5 text-[0.85rem] leading-[1.19rem]"
                        >
                          <a href={project.href}>
                            <span className="whitespace-normal break-words">{project.displayName}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
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
