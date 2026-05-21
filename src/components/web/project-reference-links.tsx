import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { withBasePath } from "@/lib/base-path";
import type { ProtocolLink } from "@/lib/protocol";

export function ProjectReferenceLinks({ references }: { references: ProtocolLink[] }) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {references.map((reference) => (
        <Button key={`${reference.label}-${reference.href}`} asChild variant="outline" size="sm">
          <a
            href={withBasePath(reference.href)}
            target={reference.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
          >
            {reference.label}
            <ArrowUpRight />
          </a>
        </Button>
      ))}
    </div>
  );
}
