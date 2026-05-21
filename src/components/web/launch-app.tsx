"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  Braces,
  Check,
  Copy,
  ExternalLink,
  FileCode2,
  FolderGit2,
  Link2,
  Search,
  ShieldAlert,
  Sparkles,
  X
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  applyDecisionChoice,
  resolveDecisionGroups,
  type ResolvedDecisionChoice,
  type ResolvedDecisionGroup
} from "@/lib/launch-decisions";
import { cn } from "@/lib/utils";

export type LaunchOption = {
  title?: string;
  description?: string;
  name: string;
  value: string;
  label: string;
  extension?: string;
  defaults?: {
    test?: string;
    build?: string;
  };
};

export type LaunchOptionGroup = {
  options: LaunchOption[];
  defaultOption: LaunchOption;
};

export type LaunchFeature = {
  name: string;
  title: string;
  description: string;
  category?: string;
  preview?: boolean;
  community?: boolean;
};

export type LaunchInitialData = {
  apiBaseUrl: string;
  generatedAt: string;
  source: "live" | "fallback";
  selectOptions: {
    type: LaunchOptionGroup;
    jdkVersion: LaunchOptionGroup;
    lang: LaunchOptionGroup;
    test: LaunchOptionGroup;
    build: LaunchOptionGroup;
  };
  applicationTypes: LaunchOption[];
  featuresByType: Record<string, LaunchFeature[]>;
};

type LaunchAppProps = {
  initialData: LaunchInitialData;
};

type FormState = {
  type: string;
  appName: string;
  basePackage: string;
  javaVersion: string;
  lang: string;
  build: string;
  test: string;
  features: string[];
};

const categoryOrder = ["API", "Database", "Messaging", "Cloud", "Security", "Server", "Development Tools"];

function slugFromType(typeValue: string, applicationTypes: LaunchOption[]) {
  return applicationTypes.find((type) => type.value === typeValue)?.name ?? "default";
}

function cleanSegment(value: string, fallback: string) {
  const cleaned = value.trim().replace(/[^A-Za-z0-9_.-]/g, "");
  return cleaned || fallback;
}

function packageName(value: string) {
  return value
    .trim()
    .replace(/[^A-Za-z0-9_.]/g, "")
    .replace(/^\.+|\.+$/g, "")
    .replace(/\.\.+/g, ".") || "com.example";
}

function projectName(appName: string, basePackage: string) {
  return `${packageName(basePackage)}.${cleanSegment(appName, "demo")}`;
}

function createQuery(state: FormState) {
  const params = new URLSearchParams({
    lang: state.lang,
    build: state.build,
    test: state.test,
    javaVersion: state.javaVersion
  });

  if (state.features.length > 0) {
    params.set("features", state.features.join(","));
  }

  return params.toString();
}

function apiUrl(baseUrl: string, action: "create" | "preview" | "diff", typeSlug: string, state: FormState) {
  return `${baseUrl}/${action}/${typeSlug}/${projectName(state.appName, state.basePackage)}?${createQuery(state)}`;
}

function cliCommand(typeSlug: string, state: FormState) {
  const creator = typeSlug === "default" ? "create-app" : `create-${typeSlug}-app`;
  const featurePart = state.features.length > 0 ? ` --features ${state.features.join(",")}` : "";
  return `mn ${creator} ${projectName(state.appName, state.basePackage)} --build ${state.build.toLowerCase()} --lang ${state.lang.toLowerCase()} --test ${state.test.toLowerCase()} --jdk ${state.javaVersion.replace("JDK_", "")}${featurePart}`;
}

function shellRunCommand(state: FormState) {
  if (state.build === "MAVEN") {
    return "./mvnw mn:run";
  }
  return "./gradlew run";
}

function initialState(data: LaunchInitialData): FormState {
  const lang = data.selectOptions.lang.defaultOption.value;
  const langDefaults = data.selectOptions.lang.defaultOption.defaults;

  return {
    type: data.selectOptions.type.defaultOption.value,
    appName: "demo",
    basePackage: "com.example",
    javaVersion: data.selectOptions.jdkVersion.defaultOption.value,
    lang,
    build: langDefaults?.build ?? data.selectOptions.build.defaultOption.value,
    test: langDefaults?.test ?? data.selectOptions.test.defaultOption.value,
    features: ["serialization-jackson"]
  };
}

function OptionSelect({
  id,
  label,
  value,
  options,
  onChange
}: {
  id: string;
  label: string;
  value: string;
  options: LaunchOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} aria-label={label} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function CodeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{label}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void navigator.clipboard?.writeText(value)}
        >
          <Copy className="size-4" />
          Copy
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-md border bg-muted p-4 text-xs leading-6 text-foreground">
        <code>{value}</code>
      </pre>
    </div>
  );
}

function FeatureCard({
  feature,
  checked,
  onToggle
}: {
  feature: LaunchFeature;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={cn(
        "grid cursor-pointer gap-3 rounded-lg border bg-card p-4 transition hover:border-primary/60",
        checked && "border-primary bg-primary/5"
      )}
      data-testid={`feature-${feature.name}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox checked={checked} onCheckedChange={onToggle} aria-label={feature.title} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold leading-5">{feature.title}</span>
            {feature.preview && <Badge variant="outline">Preview</Badge>}
            {feature.community && <Badge variant="secondary">Community</Badge>}
          </div>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
        </div>
      </div>
    </label>
  );
}

function DecisionChoiceDetails({
  group,
  choice,
  selected,
  onSelect
}: {
  group: ResolvedDecisionGroup;
  choice: ResolvedDecisionChoice;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          Details
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{choice.title}</SheetTitle>
          <SheetDescription>{group.question}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-5 px-4">
          <div className="grid gap-2">
            <p className="text-sm font-semibold">Summary</p>
            <p className="text-sm leading-6 text-muted-foreground">{choice.summary}</p>
          </div>
          <Separator />
          <div className="grid gap-2">
            <p className="text-sm font-semibold">When to use</p>
            <p className="text-sm leading-6 text-muted-foreground">{choice.whenToUse}</p>
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-semibold">When not to use</p>
            <p className="text-sm leading-6 text-muted-foreground">{choice.whenNotToUse}</p>
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-semibold">Tradeoffs</p>
            <ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
              {choice.tradeoffs.map((tradeoff) => (
                <li key={tradeoff} className="flex gap-2">
                  <span aria-hidden="true">-</span>
                  <span>{tradeoff}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-semibold">Canonical feature</p>
            <code className="rounded-md border bg-muted px-2 py-1 text-xs">
              {choice.featureName ? `--features ${choice.featureName}` : "No feature is added"}
            </code>
          </div>
        </div>
        <SheetFooter>
          <Button type="button" onClick={onSelect} disabled={selected}>
            {selected ? <Check className="size-4" /> : <Sparkles className="size-4" />}
            {selected ? "Selected" : "Use this choice"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function DecisionGroupCard({
  group,
  onSelect
}: {
  group: ResolvedDecisionGroup;
  onSelect: (group: ResolvedDecisionGroup, choice: ResolvedDecisionChoice) => void;
}) {
  const selectedChoice = group.selectedChoices[0];
  const selectedChoiceIds = new Set(group.selectedChoices.map((choice) => choice.id));

  return (
    <Card className={cn("gap-4", group.conflicted && "border-destructive/70")}>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">{group.title}</CardTitle>
              {group.conflicted && <Badge variant="outline">Resolve conflict</Badge>}
              {!group.conflicted && selectedChoice && <Badge variant="secondary">{selectedChoice.title}</Badge>}
            </div>
            <CardDescription className="mt-2">{group.description}</CardDescription>
          </div>
        </div>
        {group.conflicted && (
          <Alert variant="destructive">
            <ShieldAlert className="size-4" />
            <AlertTitle>Multiple choices selected</AlertTitle>
            <AlertDescription>
              Pick one {group.title.toLowerCase()} option. Selecting a choice removes the other features in this group.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className="grid gap-3">
        {group.choices.map((choice) => {
          const selected = selectedChoiceIds.has(choice.id) || (!choice.featureName && group.selectedChoices.length === 0);
          return (
            <div
              key={choice.id}
              className={cn(
                "grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center",
                selected && "border-primary bg-primary/5"
              )}
            >
              <button
                type="button"
                className="grid gap-1 text-left"
                onClick={() => onSelect(group, choice)}
                data-testid={`decision-${group.id}-${choice.id}`}
              >
                <span className="flex flex-wrap items-center gap-2 font-semibold">
                  {selected && <Check className="size-4 text-primary" />}
                  {choice.title}
                  {choice.featureName && <Badge variant="outline">{choice.featureName}</Badge>}
                </span>
                <span className="text-sm leading-6 text-muted-foreground">{choice.summary}</span>
              </button>
              <DecisionChoiceDetails
                group={group}
                choice={choice}
                selected={selected}
                onSelect={() => onSelect(group, choice)}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ProjectSummaryCard({
  state,
  createUrl,
  featureCount,
  catalogCount,
  conflictedDecisionGroups,
  source,
  generatedAt
}: {
  state: FormState;
  createUrl: string;
  featureCount: number;
  catalogCount: number;
  conflictedDecisionGroups: ResolvedDecisionGroup[];
  source: LaunchInitialData["source"];
  generatedAt: string;
}) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Project summary</CardTitle>
            <Badge variant={conflictedDecisionGroups.length > 0 ? "outline" : "secondary"}>
              {conflictedDecisionGroups.length > 0 ? "Needs review" : "Ready"}
            </Badge>
          </div>
          <CardDescription data-testid="project-coordinate">
            {projectName(state.appName, state.basePackage)}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-3 rounded-md bg-muted/60 px-3 py-2">
            <span className="text-muted-foreground">Runtime</span>
            <span className="text-right font-medium">
              {state.lang} / {state.build} / {state.javaVersion.replace("JDK_", "JDK ")}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-md bg-muted/60 px-3 py-2">
            <span className="text-muted-foreground">Tests</span>
            <span className="font-medium">{state.test}</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-md bg-muted/60 px-3 py-2">
            <span className="text-muted-foreground">Features</span>
            <span className="font-medium">{featureCount}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={source === "live" ? "default" : "outline"}>
            {source === "live" ? "Live backend" : "Fallback catalog"}
          </Badge>
          <Badge variant="outline">{catalogCount} feature options</Badge>
          <Badge variant="outline">{new Date(generatedAt).toLocaleDateString()}</Badge>
        </div>

        <Button asChild size="lg" className="w-full">
          <a href={createUrl} data-testid="download-project">
            <ArrowDownToLine className="size-4" />
            Download ZIP
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

export function LaunchApp({ initialData }: LaunchAppProps) {
  const [state, setState] = useState<FormState>(() => initialState(initialData));
  const [featureQuery, setFeatureQuery] = useState("");

  const typeSlug = slugFromType(state.type, initialData.applicationTypes);
  const availableFeatures = initialData.featuresByType[typeSlug] ?? initialData.featuresByType.default ?? [];
  const decisionGroups = useMemo(
    () => resolveDecisionGroups(availableFeatures, state.features),
    [availableFeatures, state.features]
  );
  const conflictedDecisionGroups = decisionGroups.filter((group) => group.conflicted);
  const selectedFeatures = availableFeatures.filter((feature) => state.features.includes(feature.name));
  const filteredFeatures = useMemo(() => {
    const query = featureQuery.trim().toLowerCase();
    const byQuery = query
      ? availableFeatures.filter((feature) =>
          [feature.name, feature.title, feature.description, feature.category ?? ""].some((value) =>
            value.toLowerCase().includes(query)
          )
        )
      : availableFeatures;

    return [...byQuery].sort((left, right) => {
      const leftCategory = categoryOrder.indexOf(left.category ?? "");
      const rightCategory = categoryOrder.indexOf(right.category ?? "");
      const leftRank = leftCategory === -1 ? categoryOrder.length : leftCategory;
      const rightRank = rightCategory === -1 ? categoryOrder.length : rightCategory;
      return leftRank - rightRank || left.title.localeCompare(right.title);
    });
  }, [availableFeatures, featureQuery]);

  const createUrl = apiUrl(initialData.apiBaseUrl, "create", typeSlug, state);
  const previewUrl = apiUrl(initialData.apiBaseUrl, "preview", typeSlug, state);
  const diffUrl = apiUrl(initialData.apiBaseUrl, "diff", typeSlug, state);
  const command = cliCommand(typeSlug, state);
  const curl = `curl --location --request GET '${createUrl}' --output ${cleanSegment(state.appName, "demo")}.zip`;
  const shareUrl =
    typeof window === "undefined"
      ? "/launch/"
      : `${window.location.origin}/launch/?type=${typeSlug}&name=${encodeURIComponent(state.appName)}&features=${encodeURIComponent(state.features.join(","))}`;

  function update(next: Partial<FormState>) {
    setState((current) => ({ ...current, ...next }));
  }

  function toggleFeature(featureName: string) {
    setState((current) => ({
      ...current,
      features: current.features.includes(featureName)
        ? current.features.filter((name) => name !== featureName)
        : [...current.features, featureName].sort()
    }));
  }

  function selectDecisionChoice(group: ResolvedDecisionGroup, choice: ResolvedDecisionChoice) {
    setState((current) => ({
      ...current,
      features: applyDecisionChoice(current.features, group, choice)
    }));
  }

  function updateLanguage(value: string) {
    const option = initialData.selectOptions.lang.options.find((item) => item.value === value);
    update({
      lang: value,
      build: option?.defaults?.build ?? state.build,
      test: option?.defaults?.test ?? state.test
    });
  }

  return (
    <main>
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-[1440px] gap-3 px-4 py-5 md:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
                Build a Micronaut project
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                Configure project settings, choose stack decisions, add starter features, and generate a ZIP.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">
                  <FileCode2 className="size-4" />
                  Preview project JSON
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Preview and diff use the real backend</DialogTitle>
                  <DialogDescription>
                    The static page can link to these API responses directly. Reading them in-browser from this origin is blocked by the backend CORS policy.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <CodeBlock value={previewUrl} label="Preview JSON endpoint" />
                  <CodeBlock value={diffUrl} label="Diff endpoint" />
                </div>
                <DialogFooter>
                  <Button asChild variant="outline">
                    <a href={previewUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" />
                      Open preview
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href={diffUrl} target="_blank" rel="noreferrer">
                      <Braces className="size-4" />
                      Open diff
                    </a>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={initialData.source === "live" ? "default" : "outline"}>
              {initialData.source === "live" ? "Live backend" : "Fallback catalog"}
            </Badge>
            <Badge variant="outline">{new Date(initialData.generatedAt).toLocaleDateString()}</Badge>
            <Badge variant="outline">{availableFeatures.length} feature options</Badge>
            <Badge variant={conflictedDecisionGroups.length > 0 ? "outline" : "secondary"}>
              {conflictedDecisionGroups.length > 0 ? `${conflictedDecisionGroups.length} conflict${conflictedDecisionGroups.length === 1 ? "" : "s"}` : "No conflicts"}
            </Badge>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 md:px-6 lg:grid-cols-[minmax(720px,1fr)_390px] lg:items-start">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project settings</CardTitle>
              <CardDescription>These fields map directly to the Micronaut Starter create, preview, and diff URL contract.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="launch-name">Name</Label>
                  <Input
                    id="launch-name"
                    value={state.appName}
                    onChange={(event) => update({ appName: event.target.value })}
                    data-testid="app-name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="launch-package">Base package</Label>
                  <Input
                    id="launch-package"
                    value={state.basePackage}
                    onChange={(event) => update({ basePackage: event.target.value })}
                    data-testid="base-package"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <OptionSelect
                  id="launch-type"
                  label="Application type"
                  value={state.type}
                  options={initialData.selectOptions.type.options}
                  onChange={(value) => update({ type: value, features: state.features.filter((name) => (initialData.featuresByType[slugFromType(value, initialData.applicationTypes)] ?? []).some((feature) => feature.name === name)) })}
                />
                <OptionSelect
                  id="launch-java"
                  label="Java version"
                  value={state.javaVersion}
                  options={initialData.selectOptions.jdkVersion.options}
                  onChange={(value) => update({ javaVersion: value })}
                />
                <OptionSelect
                  id="launch-language"
                  label="Language"
                  value={state.lang}
                  options={initialData.selectOptions.lang.options}
                  onChange={updateLanguage}
                />
                <OptionSelect
                  id="launch-build"
                  label="Build tool"
                  value={state.build}
                  options={initialData.selectOptions.build.options}
                  onChange={(value) => update({ build: value })}
                />
                <OptionSelect
                  id="launch-test"
                  label="Test framework"
                  value={state.test}
                  options={initialData.selectOptions.test.options}
                  onChange={(value) => update({ test: value })}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant={state.build === "GRADLE" ? "default" : "outline"} size="sm" onClick={() => update({ build: "GRADLE" })} data-testid="build-gradle">
                  Gradle
                </Button>
                <Button type="button" variant={state.lang === "JAVA" ? "default" : "outline"} size="sm" onClick={() => update({ lang: "JAVA", test: "JUNIT" })} data-testid="lang-java">
                  Java
                </Button>
                <Button type="button" variant={state.test === "JUNIT" ? "default" : "outline"} size="sm" onClick={() => update({ test: "JUNIT" })} data-testid="test-junit">
                  JUnit
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle>Decision Center</CardTitle>
                  <CardDescription>
                    Framework-wide choices are grouped so mutually exclusive features are easier to compare and replace.
                  </CardDescription>
                </div>
                <Badge variant={conflictedDecisionGroups.length > 0 ? "outline" : "secondary"}>
                  {conflictedDecisionGroups.length > 0 ? `${conflictedDecisionGroups.length} conflict${conflictedDecisionGroups.length === 1 ? "" : "s"}` : "No conflicts"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4" data-testid="decision-center">
              {conflictedDecisionGroups.length > 0 && (
                <Alert variant="destructive">
                  <ShieldAlert className="size-4" />
                  <AlertTitle>Resolve one-choice groups before sharing this stack</AlertTitle>
                  <AlertDescription>
                    Expert feature selection can still add conflicting features. Use the decision cards below to keep one option per group.
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid gap-4">
                {decisionGroups.map((group) => (
                  <DecisionGroupCard key={group.id} group={group} onSelect={selectDecisionChoice} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle>Starter features</CardTitle>
              <CardDescription>Feature names and categories come from the application-type feature endpoint.</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => update({ features: [] })}>
                  <X className="size-4" />
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search features, categories, or descriptions"
                  value={featureQuery}
                  onChange={(event) => setFeatureQuery(event.target.value)}
                  data-testid="feature-search"
                />
              </div>
              <div className="grid max-h-[640px] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                {filteredFeatures.slice(0, 80).map((feature) => (
                  <FeatureCard
                    key={feature.name}
                    feature={feature}
                    checked={state.features.includes(feature.name)}
                    onToggle={() => toggleFeature(feature.name)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="grid gap-6 self-start lg:sticky lg:top-20">
          <ProjectSummaryCard
            state={state}
            createUrl={createUrl}
            featureCount={state.features.length}
            catalogCount={availableFeatures.length}
            conflictedDecisionGroups={conflictedDecisionGroups}
            source={initialData.source}
            generatedAt={initialData.generatedAt}
          />

          <Card>
            <CardHeader>
              <CardTitle>Selected features</CardTitle>
              <CardDescription>{selectedFeatures.length === 0 ? "No optional features selected" : `${selectedFeatures.length} optional feature${selectedFeatures.length === 1 ? "" : "s"}`}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {conflictedDecisionGroups.length > 0 && (
                <Alert variant="destructive">
                  <ShieldAlert className="size-4" />
                  <AlertTitle>One-choice conflict</AlertTitle>
                  <AlertDescription>
                    {conflictedDecisionGroups.map((group) => group.title).join(", ")} has multiple selected choices.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <p className="text-sm font-semibold">Decisions</p>
                <div className="grid gap-2">
                  {decisionGroups.map((group) => {
                    const selected = group.selectedChoices[0];
                    return (
                      <div key={group.id} className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 p-3 text-sm">
                        <span className="text-muted-foreground">{group.title}</span>
                        <Badge variant={group.conflicted ? "outline" : "secondary"}>
                          {group.conflicted ? "Conflict" : selected?.title ?? "Default"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-2">
                {selectedFeatures.length === 0 && <p className="text-sm text-muted-foreground">Generated projects still include Micronaut's required baseline files and dependencies.</p>}
                {selectedFeatures.map((feature) => (
                  <Badge key={feature.name} variant="secondary" className="gap-1 py-1">
                    {feature.name}
                    <button type="button" aria-label={`Remove ${feature.title}`} onClick={() => toggleFeature(feature.name)}>
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generate</CardTitle>
              <CardDescription>Secondary actions are built from the same backend URL.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild variant="outline">
                <a href={previewUrl} target="_blank" rel="noreferrer" data-testid="preview-url">
                  <ExternalLink className="size-4" />
                  Open live preview JSON
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={diffUrl} target="_blank" rel="noreferrer">
                  <FileCode2 className="size-4" />
                  Open live diff
                </a>
              </Button>
              <Button asChild variant="secondary">
                <a href="https://github.com/micronaut-projects/micronaut-starter" target="_blank" rel="noreferrer">
                  <FolderGit2 className="size-4" />
                  Starter source
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commands</CardTitle>
              <CardDescription>Use the CLI or call the create endpoint directly.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <CodeBlock value={command} label="Micronaut CLI" />
              <CodeBlock value={curl} label="cURL" />
              <Separator />
              <CodeBlock value={`unzip ${cleanSegment(state.appName, "demo")}.zip\ncd ${cleanSegment(state.appName, "demo")}\n${shellRunCommand(state)}`} label="Next steps" />
            </CardContent>
          </Card>

          <Alert>
            <Sparkles className="size-4" />
            <AlertTitle>Backend integration</AlertTitle>
            <AlertDescription>
              The page links directly to `launch.micronaut.io` for project generation. Preview and diff are opened as backend responses because cross-origin reads are not available from this static origin.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Share payload</CardTitle>
              <CardDescription>Useful for testing and issue reports.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Textarea readOnly value={createUrl} data-testid="create-url" className="min-h-24 text-xs" />
              <Button type="button" variant="outline" onClick={() => void navigator.clipboard?.writeText(shareUrl)}>
                <Link2 className="size-4" />
                Copy share link
              </Button>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}
