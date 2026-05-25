import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import type { MainSiteFaqItem } from "@/lib/main-site-faq"

type FaqAccordionProps = {
  items: MainSiteFaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full rounded-md border bg-card"
      defaultValue={items[0]?.id}
    >
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} className="px-5 sm:px-6">
          <AccordionTrigger className="py-5 text-base font-semibold leading-6 text-foreground hover:text-brand hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <div
              className="grid gap-4 text-[0.96rem] leading-7 text-muted-foreground [&_a]:font-medium [&_a]:text-brand [&_a]:underline-offset-4 hover:[&_a]:underline [&_li]:pl-1 [&_p]:m-0 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2"
              dangerouslySetInnerHTML={{ __html: item.answerHtml }}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
