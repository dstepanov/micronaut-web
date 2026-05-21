/*
 * Copyright 2017-2026 original authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.micronaut.web.template;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class HtmlTemplateRendererTest {

    @Test
    void rendersRawHtmlPlaceholders() {
        var rendered = HtmlTemplateRenderer.render(
            "<main>{{title}}{{contentHtml}}</main>",
            Map.of(
                "title", "<h1>Docs</h1>",
                "contentHtml", "<section>Generated body</section>"
            )
        );

        assertEquals("<main><h1>Docs</h1><section>Generated body</section></main>", rendered);
    }

    @Test
    void rendersClasspathResources() {
        var rendered = HtmlTemplateRenderer.renderResource(
            "io/micronaut/web/template/example-template.html",
            Map.of(
                "title", "Guides",
                "contentHtml", "<article>Generated guide content</article>"
            )
        );

        assertEquals("<main><h1>Guides</h1><article>Generated guide content</article></main>\n", rendered);
    }

    @Test
    void failsWhenPlaceholdersRemainUnresolved() {
        var exception = assertThrows(
            IllegalArgumentException.class,
            () -> HtmlTemplateRenderer.render("<main>{{contentHtml}}{{sidebarHtml}}</main>", Map.of("contentHtml", "Body"))
        );

        assertEquals("Unresolved template placeholders: [sidebarHtml]", exception.getMessage());
    }

    @Test
    void escapesScalarHtml() {
        assertEquals("&lt;Micronaut &amp; Docs&gt; &quot;&#39;", HtmlTemplateRenderer.escapeHtml("<Micronaut & Docs> \"'"));
    }
}
