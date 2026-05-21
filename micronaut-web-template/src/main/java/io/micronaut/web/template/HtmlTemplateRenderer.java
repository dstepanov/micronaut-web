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

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Renders plain HTML templates packaged by the Micronaut web artifacts.
 *
 * <p>The renderer intentionally performs exact placeholder replacement only. It does not evaluate
 * expressions, loop over data, or escape injected HTML snippets. Consumer projects can therefore
 * use it without Node, Astro, React, or a server-side template engine.</p>
 */
public final class HtmlTemplateRenderer {
    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\{\\{([A-Za-z][A-Za-z0-9]*)}}");

    private HtmlTemplateRenderer() {
    }

    /**
     * Render a template loaded from the context class loader.
     *
     * @param resourceName The classpath resource name.
     * @param values Raw placeholder values keyed by placeholder name without braces.
     * @return The rendered HTML.
     */
    public static String renderResource(String resourceName, Map<String, ?> values) {
        return renderResource(Thread.currentThread().getContextClassLoader(), resourceName, values);
    }

    /**
     * Render a template loaded from the provided class loader.
     *
     * @param classLoader The class loader to read from.
     * @param resourceName The classpath resource name.
     * @param values Raw placeholder values keyed by placeholder name without braces.
     * @return The rendered HTML.
     */
    public static String renderResource(ClassLoader classLoader, String resourceName, Map<String, ?> values) {
        Objects.requireNonNull(classLoader, "classLoader");
        Objects.requireNonNull(resourceName, "resourceName");
        try (var inputStream = classLoader.getResourceAsStream(resourceName)) {
            if (inputStream == null) {
                throw new IllegalArgumentException("Template resource does not exist: " + resourceName);
            }
            return render(new String(inputStream.readAllBytes(), StandardCharsets.UTF_8), values);
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot read template resource: " + resourceName, e);
        }
    }

    /**
     * Render a template string by replacing every {@code {{name}}} placeholder with the matching
     * value. The method fails when any placeholder remains unresolved.
     *
     * @param template The template text.
     * @param values Raw placeholder values keyed by placeholder name without braces.
     * @return The rendered HTML.
     */
    public static String render(String template, Map<String, ?> values) {
        Objects.requireNonNull(template, "template");
        Objects.requireNonNull(values, "values");

        var rendered = template;
        for (var entry : values.entrySet()) {
            var key = Objects.requireNonNull(entry.getKey(), "values contains a null key");
            var value = entry.getValue() == null ? "" : entry.getValue().toString();
            rendered = rendered.replace("{{" + key + "}}", value);
        }

        var unresolved = unresolvedPlaceholders(rendered);
        if (!unresolved.isEmpty()) {
            throw new IllegalArgumentException("Unresolved template placeholders: " + unresolved);
        }
        return rendered;
    }

    /**
     * Escape scalar text before inserting it into a placeholder that is not intended to receive raw
     * trusted HTML.
     *
     * @param value The text value.
     * @return HTML-escaped text.
     */
    public static String escapeHtml(String value) {
        if (value == null || value.isEmpty()) {
            return "";
        }
        var escaped = new StringBuilder(value.length());
        for (int i = 0; i < value.length(); i++) {
            char current = value.charAt(i);
            switch (current) {
                case '&' -> escaped.append("&amp;");
                case '<' -> escaped.append("&lt;");
                case '>' -> escaped.append("&gt;");
                case '"' -> escaped.append("&quot;");
                case '\'' -> escaped.append("&#39;");
                default -> escaped.append(current);
            }
        }
        return escaped.toString();
    }

    private static Set<String> unresolvedPlaceholders(String rendered) {
        Set<String> unresolved = new LinkedHashSet<>();
        Matcher matcher = PLACEHOLDER_PATTERN.matcher(rendered);
        while (matcher.find()) {
            unresolved.add(matcher.group(1));
        }
        return unresolved;
    }
}
