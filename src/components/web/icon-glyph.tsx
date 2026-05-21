import {
  Bot,
  BookOpen,
  Boxes,
  Braces,
  Calendar,
  CheckCircle,
  Cloud,
  Code2,
  Cookie,
  Cpu,
  Database,
  FileJson,
  FolderGit2,
  Gauge,
  Gem,
  LayoutTemplate,
  Lock,
  Logs,
  Mail,
  MessageSquare,
  Package,
  Plug,
  Radar,
  Rocket,
  Route,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  TestTube2,
  Users,
  Video,
  Waypoints,
  Workflow,
  type LucideIcon
} from "lucide-react";

import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  archive: Boxes,
  "book-open": BookOpen,
  bot: Bot,
  box: Package,
  boxes: Boxes,
  braces: Braces,
  calendar: Calendar,
  "chart-line": Gauge,
  "check-circle": CheckCircle,
  cloud: Cloud,
  code: Code2,
  cookie: Cookie,
  cpu: Cpu,
  database: Database,
  "database-zap": Database,
  "file-json": FileJson,
  "folder-git-2": FolderGit2,
  gauge: Gauge,
  gem: Gem,
  "layout-template": LayoutTemplate,
  lock: Lock,
  logs: Logs,
  mail: Mail,
  "message-square": MessageSquare,
  package: Package,
  plug: Plug,
  radar: Radar,
  rocket: Rocket,
  route: Route,
  shield: Shield,
  "sliders-horizontal": SlidersHorizontal,
  sparkles: Sparkles,
  terminal: Terminal,
  "test-tube-2": TestTube2,
  users: Users,
  video: Video,
  waypoints: Waypoints,
  workflow: Workflow
};

function normalizeLucideName(name: string) {
  if (name.startsWith("lucide:")) {
    return name.slice("lucide:".length);
  }
  return name;
}

export function IconGlyph({ name, className }: { name: string; className?: string }) {
  if (name.startsWith("brand:")) {
    return (
      <img
        src={`/micronaut-assets/icons/brands/${name.slice("brand:".length)}.svg`}
        className={cn("object-contain", className)}
        alt=""
        aria-hidden="true"
      />
    );
  }
  if (name.startsWith("image:")) {
    return (
      <img
        src={`/micronaut-assets/icons/${name.slice("image:".length)}`}
        className={cn("object-contain dark:invert", className)}
        alt=""
        aria-hidden="true"
      />
    );
  }

  const Icon = icons[normalizeLucideName(name)] || icons["book-open"];
  return <Icon className={className} aria-hidden="true" />;
}
