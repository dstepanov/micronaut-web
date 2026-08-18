export function rewriteRootRelativeHtml(
  html: string,
  withBasePath: (path: string) => string,
  rewriteMicronautPath: (path: string) => string,
) {
  return html
    .replace(
      /\b(href|src)="https?:\/\/micronaut\.io(\/[^"]*)"/g,
      (_match, attribute: string, value: string) => {
        if (isLaunchPath(value)) {
          return `${attribute}="${externalLaunchUrl(value)}"`;
        }
        return `${attribute}="${withBasePath(rewriteMicronautPath(value))}"`;
      },
    )
    .replace(
      /\b(href|src)="(\/(?!\/)[^"]*)"/g,
      (_match, attribute: string, value: string) => {
        if (isLaunchPath(value)) {
          return `${attribute}="${externalLaunchUrl(value)}"`;
        }
        return `${attribute}="${withBasePath(rewriteMicronautPath(value))}"`;
      },
    );
}

function isLaunchPath(value: string) {
  return (
    value === "/launch" ||
    value.startsWith("/launch/") ||
    value.startsWith("/launch?")
  );
}

function externalLaunchUrl(value: string) {
  const suffix = value.replace(/^\/launch\/?/, "");
  return `https://launch.micronaut.io${suffix}`;
}
