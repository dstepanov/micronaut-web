import { deploySurface, type DeploySurface } from "./deployment-config.ts";

export function shouldBuildDocsRoutes(surface: DeploySurface = deploySurface) {
  return surface === "all" || surface === "docs";
}

export function shouldBuildGuidesRoutes(surface: DeploySurface = deploySurface) {
  return surface === "all" || surface === "guides";
}
