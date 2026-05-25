export function splitList(value) {
  return value ? String(value).split(",").map((item) => item.trim()).filter(Boolean) : [];
}

export function parseArgs(args) {
  const parsed = { _: [] };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      parsed._.push(arg);
      continue;
    }
    const withoutPrefix = arg.slice(2);
    const separator = withoutPrefix.indexOf("=");
    const key = camelCase(separator >= 0 ? withoutPrefix.slice(0, separator) : withoutPrefix);
    if (separator >= 0) {
      parsed[key] = withoutPrefix.slice(separator + 1);
    } else if (args[index + 1] && !args[index + 1].startsWith("--")) {
      parsed[key] = args[index + 1];
      index += 1;
    } else {
      parsed[key] = true;
    }
  }
  return parsed;
}

function camelCase(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}
