"use client";

import { useEffect, useState } from "react";
import { patientProfiles, type PatientId } from "@/app/data/patients";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  HeartPulse,
  Home,
  Info,
  LayoutDashboard,
  LineChart,
  Lock,
  Menu,
  MessageCircle,
  Pill,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type AgentStep =
  | "idle"
  | "investigating"
  | "explained"
  | "approval"
  | "active";

const navGroups = [
  {
    label: "Overview",
    items: [{ label: "Health overview", icon: LayoutDashboard }],
  },
  {
    label: "Medical record",
    items: [
      { label: "Medical records", icon: Stethoscope },
      { label: "Labs", icon: LineChart },
      { label: "Imaging", icon: Activity },
      { label: "Family history", icon: UserRound },
      { label: "Genetics", icon: ShieldCheck },
    ],
  },
  {
    label: "Daily care",
    items: [
      { label: "Medications", icon: Pill },
      { label: "Appointments", icon: CalendarDays },
      { label: "Symptoms", icon: AlertCircle },
    ],
  },
  {
    label: "Body & biometrics",
    items: [
      { label: "Heart health", icon: HeartPulse },
      { label: "Blood pressure", icon: Activity },
      { label: "Wearables", icon: Activity },
      { label: "Home devices", icon: Home },
    ],
  },
  {
    label: "Lifestyle",
    items: [
      { label: "Sleep", icon: Clock3 },
      { label: "Activity", icon: Activity },
      { label: "Nutrition", icon: Sparkles },
      { label: "My health info", icon: UserRound },
    ],
  },
];

export default function HomePage() {
  const [activeNav, setActiveNav] = useState("Health overview");
  const [agentExpanded, setAgentExpanded] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [agentStep, setAgentStep] = useState<AgentStep>("idle");
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [investigationProgress, setInvestigationProgress] = useState(0);
  const [heartRateRange, setHeartRateRange] = useState("14D");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<PatientId>("jordan");

  // Conversational agent
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "agent" | "user"; text: string }[]
  >([
    {
      role: "agent",
      text: "Hi. I’m your HealthOS agent. I’ve been reviewing your connected health data and can help explain what I’m seeing.",
    },
  ]);

  const selectedPatient = patientProfiles[selectedPatientId];
  const [chatMinimized, setChatMinimized] = useState(false);
  const getAgentResponse = (question: string) => {
    const normalized = question.toLowerCase();

    if (
      normalized.includes("why") ||
      normalized.includes("watch") ||
      normalized.includes("looking")
    ) {
      return `I’m watching ${selectedPatient.dashboard.attentionFocus.toLowerCase()} because I noticed a pattern across your connected signals. ${selectedPatient.agent.insightDetail} I’m comparing the change against your personal baseline rather than reacting to a single reading.`;
    }

    if (
      normalized.includes("what") &&
      (normalized.includes("find") ||
        normalized.includes("notice") ||
        normalized.includes("see"))
    ) {
      return selectedPatient.agent.whatNoticed;
    }

    if (
      normalized.includes("should") ||
      normalized.includes("next") ||
      normalized.includes("do")
    ) {
      return `${selectedPatient.agent.recommendationTitle} ${selectedPatient.agent.recommendationDetail}`;
    }

    if (
      normalized.includes("appointment") ||
      normalized.includes("doctor") ||
      normalized.includes("clinician")
    ) {
      return `Your next appointment is ${selectedPatient.appointment.title} with ${selectedPatient.appointment.clinician}. It’s ${selectedPatient.appointment.dateTime} at ${selectedPatient.appointment.location}. ${selectedPatient.appointment.preparation}`;
    }

    if (
      normalized.includes("med") ||
      normalized.includes("medication") ||
      normalized.includes("medicine")
    ) {
      const medications = selectedPatient.medications
        .map(
          (medication) =>
            `${medication.name}, ${medication.dose}, ${medication.time} (${medication.status})`,
        )
        .join("; ");

      return `Today’s medications: ${medications}. Reminder status does not confirm that a dose was taken.`;
    }

    return `I’m currently focused on ${selectedPatient.dashboard.attentionFocus.toLowerCase()}. ${selectedPatient.agent.insightDetail} I can also explain what I found, why I’m watching it, or what I recommend next.`;
  };

  const sendChatMessage = (message?: string) => {
    const text = (message ?? chatInput).trim();

    if (!text) return;

    const response = getAgentResponse(text);

    setChatMessages((current) => [
      ...current,
      { role: "user", text },
      { role: "agent", text: response },
    ]);

    setChatInput("");
  };
  const visiblePrimaryMetricData =
  selectedPatient.primaryMetric.ranges?.length
    ? selectedPatient.primaryMetric.data.slice(
        -(
          selectedPatient.primaryMetric.ranges.find(
            (range) => range.label === heartRateRange,
          )?.days ?? selectedPatient.primaryMetric.data.length
        ),
      )
    : selectedPatient.primaryMetric.data;

  const signalIcons = {
    heart: HeartPulse,
    clock: Clock3,
    activity: Activity,
    droplet: Activity,
    baby: UserRound,
    pill: Pill,
  };

  useEffect(() => {
    setAgentExpanded(false);
    setShowSources(false);
    setDismissed(false);
    setAgentStep("idle");
    setMonitoringActive(false);
    setInvestigationProgress(0);
    setHeartRateRange("14D");
    setChatInput("");
    setChatMessages([
      {
        role: "agent",
        text: `Hi. I’m your HealthOS agent. I’m currently reviewing ${selectedPatient.name}’s connected health data and can help explain what I’m seeing.`,
      },
    ]);
  }, [selectedPatientId, selectedPatient.name]);

  useEffect(() => {
    if (!agentExpanded || agentStep !== "investigating") {
      return;
    }

    if (investigationProgress >= 4) {
      return;
    }

    const timer = window.setTimeout(() => {
      setInvestigationProgress((current) => current + 1);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [agentExpanded, agentStep, investigationProgress]);

  useEffect(() => {
    if (!agentExpanded) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAgentExpanded(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [agentExpanded]);

  useEffect(() => {
    if (agentExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [agentExpanded]);

  const startInvestigation = () => {
    setShowSources(false);
    setInvestigationProgress(0);
    setAgentStep("investigating");
    setAgentExpanded(true);
  };

  const stopInvestigation = () => {
    setInvestigationProgress(0);
    setAgentStep("idle");
  };

  const investigationComplete = investigationProgress >= 4;

  const continueToExplanation = () => {
    if (!investigationComplete) return;
    setAgentStep("explained");
  };

  const goBackToInvestigation = () => {
    setAgentStep("investigating");
    setInvestigationProgress(4);
  };

  const goToApproval = () => {
    setAgentStep("approval");
  };

  const startMonitoring = () => {
    setMonitoringActive(true);
    setAgentStep("active");
    setDismissed(true);
  };

  const openAgent = () => {
    setAgentExpanded(true);
  };

  const closeAgent = () => {
    setAgentExpanded(false);
  };

  const handleNavSelection = (label: string) => {
    setActiveNav(label);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside
          aria-label="Primary navigation"
          className="hidden w-[245px] shrink-0 border-r border-slate-300 bg-white lg:flex lg:flex-col"
        >
          <div className="border-b border-slate-200 px-5 py-5">
            <div className="flex items-center gap-2.5">
              <div
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#17479E] text-white"
              >
                <HeartPulse className="h-5 w-5" />
              </div>

              <div>
                <div className="text-lg font-semibold tracking-tight">
                  HealthOS
                </div>
                <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-600">
                  AI health agent
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-5">
                <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                  {group.label}
                </div>

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const selected = activeNav === item.label;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      aria-current={selected ? "page" : undefined}
                      onClick={() => handleNavSelection(item.label)}
                      className={`mb-0.5 flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17479E] focus-visible:ring-offset-1 ${
                        selected
                          ? "bg-[#E8F1FB] font-medium text-[#17479E]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
              <div
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200"
              >
                <UserRound className="h-4 w-4 text-slate-700" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{selectedPatient.name}</div>
                <div className="text-xs text-slate-600">Health profile</div>
              </div>

              <ChevronRight
                className="h-4 w-4 text-slate-500"
                aria-hidden="true"
              />
            </div>
          </div>
        </aside>

        {/* Mobile navigation */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileNavOpen(false)}
              className="absolute inset-0 bg-slate-900/40"
            />

            <aside
              aria-label="Mobile navigation"
              className="relative flex h-full w-[290px] max-w-[85vw] flex-col border-r border-slate-300 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
                <div className="flex items-center gap-2.5">
                  <div
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#17479E] text-white"
                  >
                    <HeartPulse className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="text-lg font-semibold tracking-tight">
                      HealthOS
                    </div>
                    <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-600">
                      AI health agent
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17479E]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4">
                {navGroups.map((group) => (
                  <div key={group.label} className="mb-5">
                    <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                      {group.label}
                    </div>

                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const selected = activeNav === item.label;

                      return (
                        <button
                          key={item.label}
                          type="button"
                          aria-current={selected ? "page" : undefined}
                          onClick={() => handleNavSelection(item.label)}
                          className={`mb-0.5 flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17479E] ${
                            selected
                              ? "bg-[#E8F1FB] font-medium text-[#17479E]"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <Icon
                            className="h-5 w-5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Header */}
          <header className="flex min-h-[72px] items-center justify-between border-b border-slate-300 bg-white px-5 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                aria-expanded={mobileNavOpen}
                onClick={() => setMobileNavOpen(true)}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17479E] lg:hidden"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>

              <div>
                <div className="text-base font-medium text-slate-900">
                  Health overview
                </div>
                <div className="hidden text-xs text-slate-600 sm:block">
                  Your health, connected and continuously monitored
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 sm:flex">
                <label htmlFor="demo-patient" className="text-xs font-medium text-slate-600">
                  Demo patient
                </label>
                <div className="relative">
                  <select
                    id="demo-patient"
                    value={selectedPatientId}
                    onChange={(event) => setSelectedPatientId(event.target.value as PatientId)}
                    className="min-h-11 appearance-none rounded-lg border border-[#BFD2EA] bg-[#F4F8FD] py-2 pl-3 pr-9 text-sm font-medium text-[#17479E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17479E]"
                  >
                    <option value="jordan">Jordan</option>
                    <option value="maya">Maya</option>
                    <option value="alex">Alex</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#17479E]" aria-hidden="true" />
                </div>
              </div>

              <div className="hidden rounded-full border border-[#BFD2EA] bg-[#F4F8FD] px-3 py-1.5 text-xs font-medium text-[#17479E] lg:block">
                Illustrative demo data
              </div>

              <button
                type="button"
                aria-label="View notifications"
                className="relative flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17479E]"
              >
                <Bell
                  className="h-5 w-5 text-slate-600"
                  aria-hidden="true"
                />
                <span
                  className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#FEBC11] ring-2 ring-white"
                  aria-hidden="true"
                />
              </button>

              <div
                aria-label={`${selectedPatient.name} profile`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700"
              >
                {selectedPatient.initials}
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1450px] px-5 py-7 lg:px-8 lg:py-9">
            {/* Greeting */}
            <div className="mb-7">
              <h1 className="text-[30px] font-semibold tracking-tight text-slate-900">
                Good morning, {selectedPatient.name}.
              </h1>

              <p className="mt-1.5 text-base leading-6 text-slate-600">
                Here’s what your health agent is watching today.
              </p>
            </div>

            {/* Top cards */}
            <div className="grid gap-5 xl:grid-cols-3">
              {/* Health status */}
              <Card className="border-slate-300 shadow-none">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-base font-semibold">
                      Health status
                    </CardTitle>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <ShieldCheck
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                      Based on connected data
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-4">
                    <div
                      aria-hidden="true"
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F1FB]"
                    >
                      <Check className="h-6 w-6 text-[#17479E]" />
                    </div>

                    <div>
                      <div className="text-xl font-semibold text-slate-900">
                        {selectedPatient.status.label}
                      </div>
                      <div className="text-sm text-slate-600">
                        {selectedPatient.status.detail}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-lg border border-[#BFD2EA] bg-[#F7FAFE] px-3.5 py-3">
                    <div className="flex items-center gap-2">
                      <Sparkles
                        className="h-4 w-4 text-[#17479E]"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium text-[#17479E]">
                        {selectedPatient.status.watchLabel}
                      </span>
                    </div>

                    <div className="mt-1.5 text-sm leading-5 text-slate-600">
                      {selectedPatient.status.watchDetail}
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Last updated</span>
                      <span className="font-medium text-slate-800">
                        {selectedPatient.status.updated}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Today's meds */}
              <Card className="border-slate-300 shadow-none">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      Today’s medications
                    </CardTitle>

                    <Pill className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {selectedPatient.medications.map((medication) => (
                      <div key={`${medication.name}-${medication.time}`} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                            <Pill className="h-4 w-4 text-slate-600" />
                          </div>

                          <div>
                            <div className="text-sm font-medium">{medication.name}</div>
                            <div className="text-xs text-slate-600">
                              {medication.dose} · {medication.time}
                            </div>
                          </div>
                        </div>

                        <span className={`rounded-full px-2.5 py-1.5 text-xs font-medium ${medication.tone === "blue" ? "bg-[#E8F1FB] text-[#17479E]" : "bg-slate-100 text-slate-700"}`}>
                          {medication.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 text-xs leading-5 text-slate-600">
                    Reminder status does not confirm that a dose was taken.
                  </div>
                </CardContent>
              </Card>

              {/* Appointment */}
              <Card className="border-slate-300 shadow-none">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      Next appointment
                    </CardTitle>

                    <CalendarDays className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="text-base font-semibold text-slate-900">
                    {selectedPatient.appointment.title}
                  </div>

                  <div className="mt-1 text-sm text-slate-700">
                    {selectedPatient.appointment.clinician}
                  </div>

                  <div className="mt-4 space-y-2.5 text-sm text-slate-600">
                    <div className="flex items-start gap-2.5">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{selectedPatient.appointment.dateTime}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Home className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{selectedPatient.appointment.location}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                    <span className="text-sm text-slate-600">
                      {selectedPatient.appointment.preparation}
                    </span>

                    <button
                      type="button"
                      className="flex min-h-11 items-center rounded-md px-2.5 text-sm font-medium text-[#17479E] hover:bg-[#F4F8FD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17479E]"
                    >
                      View details
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lower dashboard */}
            <div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
              {/* Left column */}
              <div className="space-y-5">
                {/* Primary metric */}
                <Card className="border-slate-300 shadow-none xl:min-h-[420px]">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-base font-semibold">
                        {selectedPatient.dashboard.primaryMetricLabel}
                        </CardTitle>

                        <div className="mt-1 text-sm text-slate-600">
                        {selectedPatient.primaryMetric.subtitle}
                        </div>
                      </div>

                      <div
                        role="group"
                        aria-label={`${selectedPatient.primaryMetric.title} time range`}
                        className="flex rounded-lg border border-slate-300 bg-slate-50 p-0.5"
                      >
                        {(selectedPatient.primaryMetric.ranges ?? []).map((range) => (
                          <button
                            key={range.label}
                            type="button"
                            aria-pressed={heartRateRange === range.label}
                            onClick={() => setHeartRateRange(range.label)}
                            className={`flex min-h-11 min-w-12 items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17479E] focus-visible:ring-offset-1 ${
                              heartRateRange === range.label
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-600 hover:text-slate-800"
                            }`}
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-4 flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-semibold tracking-tight">
                          {selectedPatient.primaryMetric.latest}{selectedPatientId === "jordan" ? " bpm" : selectedPatientId === "alex" ? " mg/dL" : " weeks"}
                        </div>

                        <div className="mt-1 text-sm text-slate-600">
                          {selectedPatient.primaryMetric.latestLabel}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-slate-600">
                          {selectedPatient.primaryMetric.baselineLabel}
                        </div>

                        <div className="text-sm font-medium text-slate-800">
                          {selectedPatient.primaryMetric.baseline}
                        </div>
                      </div>
                    </div>

                    <ChartContainer
                      config={{
                        value: {
                          label: selectedPatient.primaryMetric.seriesLabel,
                          color: "#0090BA",
                        },
                      }}
                      className="h-[280px] w-full"
                    >
                      <AreaChart
                        accessibilityLayer
                        data={visiblePrimaryMetricData}
                        margin={{
                          left: -18,
                          right: 8,
                          top: 8,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid vertical={false} />

                        <XAxis
                          dataKey="day"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{ fontSize: 12 }}
                          interval={2}
                        />

                        <YAxis
                          domain={selectedPatient.primaryMetric.domain}
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{ fontSize: 12 }}
                          width={34}
                        />

                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />

                        <Area
                          dataKey="baselineHigh"
                          type="monotone"
                          fill="var(--color-bpm)"
                          fillOpacity={0.06}
                          stroke="none"
                          dot={false}
                        />

                        <Area
                          dataKey="baselineLow"
                          type="monotone"
                          fill="var(--color-bpm)"
                          fillOpacity={0.06}
                          stroke="none"
                          dot={false}
                        />

                        <Area
                          dataKey="value"
                          type="monotone"
                          fill="var(--color-bpm)"
                          fillOpacity={0.15}
                          stroke="var(--color-bpm)"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      </AreaChart>
                    </ChartContainer>

                    <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full bg-[#0090BA]"
                          aria-hidden="true"
                        />
                        {selectedPatient.primaryMetric.seriesLabel}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-5 rounded-sm bg-[#DDEFF4]"
                          aria-hidden="true"
                        />
                        {selectedPatient.primaryMetric.baselineSeriesLabel}
                      </div>
                    </div>

                    <p className="sr-only">
                      {selectedPatient.primaryMetric.accessibility}
                    </p>
                  </CardContent>
                </Card>

                {/* Connected signals */}
                <Card className="border-slate-300 shadow-none">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-base font-semibold text-slate-800">
                          Connected signals
                        </CardTitle>

                        <p className="mt-1 text-sm leading-5 text-slate-600">
                          {selectedPatient.dashboard.connectedSignalsSubtitle}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#E8F1FB] px-2.5 py-1.5 text-xs font-medium text-[#17479E]">
                        <Sparkles
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Agent detected a pattern
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid gap-3 md:grid-cols-3">
                      {selectedPatient.connectedSignals.map((signal) => {
                        const SignalIcon = signalIcons[signal.icon];

                        return (
                          <div key={signal.label} className="rounded-xl border border-slate-300 bg-white p-4">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F1FB]">
                                  <SignalIcon className="h-4 w-4 text-[#17479E]" />
                                </div>

                                <span className="text-sm font-medium text-slate-700">{signal.label}</span>
                              </div>

                              {signal.trend && (
                                <span className="text-xs font-semibold text-[#17479E]">{signal.trend}</span>
                              )}
                            </div>

                            <div className="mt-3 flex items-end gap-2">
                              <span className="text-xl font-semibold tracking-tight text-slate-800">{signal.value}</span>
                              {signal.unit && <span className="mb-0.5 text-sm text-slate-600">{signal.unit}</span>}
                            </div>

                            <div aria-hidden="true" className="mt-3 flex h-7 items-end gap-1">
                              {signal.bars.map((height, index) => (
                                <div key={index} className="flex-1 rounded-sm bg-[#0090BA]/20" style={{ height: `${height}px` }} />
                              ))}
                            </div>

                            <div className="mt-1.5 text-sm leading-5 text-slate-600">{signal.detail}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Agent interpretation */}
                    <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-xl border border-[#BFD2EA] bg-[#F7FAFE] p-4 sm:flex-row">
                      <div className="flex items-start gap-3">
                        <div
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F1FB]"
                        >
                          <Sparkles className="h-4 w-4 text-[#17479E]" />
                        </div>

                        <div>
                          <div className="text-sm font-semibold uppercase tracking-[0.08em] text-[#17479E]">
                            What this may mean
                          </div>

                          <div className="mt-1.5 text-sm leading-6 text-slate-700">
                            These signals are changing together. The pattern
                            is worth watching, but the available data cannot
                            determine why they are changing or whether there is
                            a medical cause.
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={startInvestigation}
                        className="min-h-11 shrink-0 border-slate-300 bg-white px-4 text-sm text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#17479E] focus-visible:ring-offset-2"
                      >
                        View pattern
                        <ArrowRight
                          className="ml-1.5 h-4 w-4"
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-300 shadow-none">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-base font-semibold">
                        Personal baselines
                      </CardTitle>

                      <span className="text-sm text-slate-600">
                        {selectedPatient.dashboard.baselineSubtitle}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedPatient.baselines.map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-lg bg-slate-50 p-3.5"
                        >
                          <div className="text-xs font-medium uppercase tracking-wide text-slate-600">
                            {label}
                          </div>

                          <div className="mt-1.5 text-base font-semibold text-slate-900">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right column: agent work */}
              <div className="space-y-5">

              <section aria-labelledby="health-summary-heading">
  <Card className="border-slate-300 bg-white">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <CardTitle
            id="health-summary-heading"
            className="text-base font-semibold text-slate-900"
          >
            Current health summary
          </CardTitle>
          <p className="mt-1 text-xs text-slate-500">
            A synthesized view of your recent health data
          </p>
        </div>

        <div className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          Updated today
        </div>
      </div>
    </CardHeader>

    <CardContent className="pt-0">
      <p className="max-w-4xl text-sm leading-6 text-slate-700">
        {selectedPatient.dashboard.healthSummary}
      </p>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Sparkles
          className="h-3.5 w-3.5 text-[#17479E]"
          aria-hidden="true"
        />
        <span>HealthOS synthesized this summary from your recent data</span>
      </div>
    </CardContent>
  </Card>
</section>

                {/* Agent insight */}
                {!dismissed && (
  <section aria-labelledby="agent-insight-heading">
    <Card className="border-slate-300 bg-slate-50/40 shadow-none">
      <CardContent className="p-0">
        <button
          type="button"
          aria-expanded={agentExpanded}
          aria-controls="health-agent-modal"
          onClick={openAgent}
          className="group flex min-h-[104px] w-full items-center justify-between gap-5 px-5 py-5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17479E] focus-visible:ring-offset-[-2px] lg:px-6"
        >
                      <div className="flex min-w-0 items-start gap-4">
                        <div
                          aria-hidden="true"
                          className="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FB]"
                        >
                          <Sparkles className="h-5 w-5 text-[#17479E]" />

                          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#FEBC11] ring-2 ring-white motion-safe:animate-pulse motion-reduce:animate-none" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                          <div>
  <div
    id="agent-insight-heading"
    className="text-sm font-semibold uppercase tracking-[0.06em] text-[#17479E]"
  >
    Agent insight
  </div>

  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
    {selectedPatient.dashboard.attentionFocus}
  </p>
</div>

                            <span className="rounded-full bg-[#FFF7DF] px-2.5 py-1 text-xs font-medium text-slate-800">
                              {selectedPatient.agent.confidence}
                            </span>
                          </div>

                          <div className="mt-1.5 text-base font-semibold text-slate-900">
                            {selectedPatient.agent.insightTitle}
                          </div>

                          <div className="mt-1 text-sm leading-6 text-slate-700">
                            {selectedPatient.agent.insightDetail}
                          </div>

                          <div className="mt-2 text-sm font-medium text-[#17479E]">
                            Review insight
                            <ArrowRight
                              className="ml-1 inline h-4 w-4"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </div>

                      <ChevronRight
                        className="h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:text-[#17479E]"
                        aria-hidden="true"
                      />
                    </button>
                  </CardContent>
                </Card>
              </section>
            )}


                {/* Agent activity */}
                <Card
                  className={`border-slate-300 shadow-none ${
                    monitoringActive
                      ? "border-l-4 border-l-[#FEBC11]"
                      : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-base font-semibold">
                        Agent activity
                      </CardTitle>

                      {monitoringActive ? (
                        <span
                          role="status"
                          className="flex items-center gap-1.5 text-sm font-medium text-[#17479E]"
                        >
                          <span
                            className="h-2 w-2 rounded-full bg-[#FEBC11] motion-safe:animate-pulse motion-reduce:animate-none"
                            aria-hidden="true"
                          />
                          Active
                        </span>
                      ) : (
                        <span className="text-sm text-slate-600">
                          No active tasks
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    {monitoringActive ? (
                      <div>
                        <div className="flex items-start gap-3">
                          <div
                            aria-hidden="true"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F1FB]"
                          >
                            <Activity className="h-5 w-5 text-[#17479E]" />
                          </div>

                          <div className="min-w-0">
                            <div className="text-base font-semibold text-slate-800">
                              7-day monitoring active
                            </div>

                            <div className="mt-1.5 text-sm leading-5 text-slate-600">
                              {selectedPatient.agent.monitoringTitle}
                            </div>

                            <div className="mt-2 text-sm leading-5 text-slate-700">
                              Comparing new readings against your {selectedPatient.agent.monitoringBaseline}
                              personal baseline.
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-lg bg-slate-50 px-3.5 py-3">
                          <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-slate-600">
                              Started Oct 4 · Approved by you
                            </span>

                            <span className="font-medium text-slate-800">
                              Next check-in · {selectedPatient.agent.nextCheckIn}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-[#17479E]">
                            <Check
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            Agent action · User approved
                          </div>

                          <button
                            type="button"
                            onClick={openAgent}
                            className="min-h-11 rounded-md px-2.5 text-sm font-medium text-[#17479E] hover:bg-[#F4F8FD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17479E]"
                          >
                            View details
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div
                          aria-hidden="true"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100"
                        >
                          <Sparkles className="h-5 w-5 text-slate-600" />
                        </div>

                        <div>
                          <div className="text-base font-medium text-slate-800">
                            Monitoring your connected signals
                          </div>

                          <div className="mt-1.5 text-sm leading-5 text-slate-600">
                            The agent reviews trends against your personal
                            baselines and surfaces meaningful changes.
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Personal baselines */}
                
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-7 flex flex-col gap-2 border-t border-slate-300 pt-5 text-sm leading-5 text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <div>
                Independent portfolio concept · Not an official Baylor Scott &
                White product
              </div>

              <div>All patient data shown is fictional and illustrative.</div>
            </footer>
          </div>
        </main>
      </div>


      {/* Conversational health agent */}
      {chatMinimized ? (
        <button
          type="button"
          onClick={() => setChatMinimized(false)}
          aria-label="Reopen HealthOS conversational agent"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full border border-slate-300 bg-white px-4 py-3 shadow-xl hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17479E]"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F1FB]">
            <Sparkles className="h-4 w-4 text-[#17479E]" />
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#FEBC11] ring-2 ring-white"
            />
          </div>
      
          <div className="text-left">
            <div className="text-sm font-semibold text-slate-900">
              Health agent
            </div>
            <div className="text-xs text-slate-500">
              Ask me anything
            </div>
          </div>
        </button>
      ) : (
        <section
          aria-label="HealthOS conversational agent"
          className="fixed bottom-5 right-5 z-50 hidden w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl sm:block"
        >
        {/* Chat header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F1FB]">
              <Sparkles className="h-4 w-4 text-[#17479E]" />

              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#FEBC11] ring-2 ring-white"
              />
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-900">
                Health agent
              </div>

              <div className="text-xs text-slate-500">
                Working with {selectedPatient.name}’s health data
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
  <span className="rounded-full bg-[#E8F1FB] px-2 py-1 text-xs font-medium text-[#17479E]">
    Active
  </span>

  <button
    type="button"
    onClick={() => setChatMinimized(true)}
    aria-label="Minimize HealthOS conversational agent"
    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17479E]"
  >
    <span className="text-lg leading-none" aria-hidden="true">
      −
    </span>
  </button>
</div>
        </div>

        {/* Messages */}
        <div
          className="max-h-[330px] min-h-[220px] space-y-3 overflow-y-auto bg-slate-50/60 px-4 py-4"
          aria-live="polite"
        >
          {chatMessages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-5 ${
                  message.role === "user"
                    ? "bg-[#17479E] text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        {/* Suggested questions */}
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Ask your agent
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "Why are you watching this?",
              "What did you find?",
              "What should I do next?",
            ].map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendChatMessage(question)}
                className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17479E]"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendChatMessage();
          }}
          className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
        >
          <input
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            placeholder="Ask about your health..."
            aria-label="Ask your health agent"
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#17479E] focus:ring-2 focus:ring-[#17479E]/20"
          />

          <Button
            type="submit"
            size="icon"
            aria-label="Send message"
            className="h-11 w-11 shrink-0 bg-[#17479E] text-white hover:bg-[#123B82]"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
      </section>
    )}


      {/* Health Agent modal */}
      {agentExpanded && (
        <div
          id="health-agent-modal"
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAgent();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="agent-modal-title"
            aria-describedby="agent-modal-description"
            className="flex max-h-[94vh] w-full max-w-[900px] flex-col overflow-hidden rounded-t-2xl border border-slate-300 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
          >
            {/* Modal header */}
            <div className="flex shrink-0 items-start justify-between gap-5 border-b border-slate-200 px-5 py-5 lg:px-7">
              <div className="flex min-w-0 items-start gap-3.5">
                <div
                  aria-hidden="true"
                  className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FB]"
                >
                  {monitoringActive ? (
                    <Check className="h-5 w-5 text-[#17479E]" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-[#17479E]" />
                  )}

                  <span
                    className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#FEBC11] ring-2 ring-white ${
                      agentStep === "investigating"
                        ? "motion-safe:animate-pulse motion-reduce:animate-none"
                        : ""
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2
                      id="agent-modal-title"
                      className="text-lg font-semibold text-slate-900"
                    >
                      Health agent
                    </h2>

                    <span
                      role="status"
                      aria-live="polite"
                      className="rounded-full bg-[#E8F1FB] px-2.5 py-1 text-xs font-medium text-[#17479E]"
                    >
                      {monitoringActive
                        ? "Monitoring active"
                        : agentStep === "idle"
                          ? "Review available"
                          : agentStep === "investigating"
                            ? "Reviewing"
                            : agentStep === "explained"
                              ? "Finding explained"
                              : "Awaiting approval"}
                    </span>
                  </div>

                  <p
                    id="agent-modal-description"
                    className="mt-1.5 text-sm leading-5 text-slate-600"
                  >
                    {monitoringActive
                      ? "Your approved monitoring plan is active."
                      : "Review what the agent checked, what it found, and what it recommends next."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeAgent}
                aria-label="Close health agent"
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17479E] focus-visible:ring-offset-2"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Stepper */}
            <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-5 py-5 lg:px-7">
              <div className="mx-auto max-w-[760px]">
                <div className="grid grid-cols-4 gap-1">
                  {[
                    {
                      key: "investigate",
                      label: "Investigate",
                      complete:
                        agentStep === "explained" ||
                        agentStep === "approval" ||
                        agentStep === "active",
                      active: agentStep === "investigating",
                    },
                    {
                      key: "explain",
                      label: "Explain",
                      complete:
                        agentStep === "approval" || agentStep === "active",
                      active: agentStep === "explained",
                    },
                    {
                      key: "approve",
                      label: "Approve",
                      complete: agentStep === "active",
                      active: agentStep === "approval",
                    },
                    {
                      key: "monitor",
                      label: "Monitor",
                      complete: agentStep === "active",
                      active: agentStep === "active",
                    },
                  ].map((step, index) => (
                    <div key={step.key} className="relative">
                      {index > 0 && (
                        <div
                          aria-hidden="true"
                          className={`absolute left-[-50%] right-[50%] top-4 h-0.5 ${
                            step.complete || step.active
                              ? "bg-[#17479E]"
                              : "bg-slate-300"
                          }`}
                        />
                      )}

                      <div className="relative flex flex-col items-center gap-2">
                        <div
                          aria-hidden="true"
                          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                            step.complete
                              ? "border-[#17479E] bg-[#17479E] text-white"
                              : step.active
                                ? "border-[#17479E] bg-white text-[#17479E]"
                                : "border-slate-300 bg-white text-slate-500"
                          }`}
                        >
                          {step.complete ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>

                        <span
                          className={`text-sm font-medium ${
                            step.active || step.complete
                              ? "text-slate-800"
                              : "text-slate-500"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal content */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="px-5 py-6 lg:px-7 lg:py-7">
                {/* IDLE */}
                {agentStep === "idle" && !monitoringActive && (
                  <div className="mx-auto max-w-[760px]">
                    <div className="rounded-xl border border-slate-300 bg-slate-50 p-5 lg:p-6">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-lg font-semibold text-slate-900">
                            {selectedPatient.agent.idleTitle}
                          </div>

                          <div className="mt-2 text-sm leading-6 text-slate-600">
                            {selectedPatient.agent.idleDescription}
                          </div>
                        </div>

                        <div className="shrink-0 rounded-lg bg-white px-4 py-3 text-left shadow-sm sm:text-right">
                          <div className="text-2xl font-semibold text-slate-900">
                            {selectedPatient.agent.currentValue}
                          </div>

                          <div className="text-xs font-medium uppercase tracking-wide text-slate-600">
                            {selectedPatient.agent.currentUnit}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {selectedPatient.agent.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-[#BFD2EA] bg-[#F7FAFE] p-5">
                      <div className="flex items-start gap-3">
                        <Lock
                          className="mt-0.5 h-5 w-5 shrink-0 text-[#17479E]"
                          aria-hidden="true"
                        />

                        <div>
                          <div className="text-sm font-semibold text-slate-800">
                            How the agent works
                          </div>

                          <div className="mt-1.5 text-sm leading-6 text-slate-600">
                            The agent reviews multiple signals before
                            recommending an action. It will not contact a
                            clinician, change medication, or schedule an
                            appointment without your approval.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Button
                        onClick={startInvestigation}
                        className="min-h-11 bg-[#17479E] px-4 text-sm text-white hover:bg-[#123B82] focus-visible:ring-2 focus-visible:ring-[#17479E] focus-visible:ring-offset-2"
                      >
                        Investigate pattern
                        <ArrowRight
                          className="ml-1.5 h-4 w-4"
                          aria-hidden="true"
                        />
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          setDismissed(true);
                          closeAgent();
                        }}
                        className="min-h-11 text-sm text-slate-700 focus-visible:ring-2 focus-visible:ring-[#17479E] focus-visible:ring-offset-2"
                      >
                        Not now
                      </Button>
                    </div>
                  </div>
                )}

                {/* INVESTIGATING */}
                {agentStep === "investigating" && (
                  <div className="mx-auto max-w-[760px]">
                    <div className="mb-6">
                      <div className="text-lg font-semibold text-slate-900">
                        Reviewing your recent health signals
                      </div>

                      <div className="mt-2 text-sm leading-6 text-slate-600">
                        I’m looking for a sustained change rather than reacting
                        to one reading. I’ll compare the trend with your own
                        history and related signals before suggesting what to
                        do next.
                      </div>

                      <div
                        role="status"
                        aria-live="polite"
                        className="sr-only"
                      >
                        {investigationComplete
                          ? "The agent has finished reviewing all four evidence steps."
                          : `The agent has completed ${investigationProgress} of 4 evidence review steps.`}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedPatient.agent.steps.map((step) => {
                        const completed =
                          investigationProgress >= step.number;

                        const current =
                          investigationProgress === step.number - 1;

                        return (
                          <div
                            key={step.number}
                            className={`flex items-center gap-4 rounded-xl border px-4 py-4 transition-all duration-500 motion-reduce:transition-none ${
                              completed
                                ? "border-[#BFD2EA] bg-[#F7FAFE]"
                                : current
                                  ? "border-[#9FBBDD] bg-white shadow-sm"
                                  : "border-slate-200 bg-white"
                            }`}
                          >
                            <div
                              aria-hidden="true"
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                                completed
                                  ? "bg-[#17479E] text-white"
                                  : current
                                    ? "border-2 border-[#17479E] bg-white text-[#17479E]"
                                    : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {completed ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                step.number
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div
                                className={`text-sm font-medium ${
                                  current || completed
                                    ? "text-slate-800"
                                    : "text-slate-600"
                                }`}
                              >
                                {step.title}
                              </div>

                              <div className="mt-0.5 text-sm text-slate-600">
                                {step.detail}
                              </div>
                            </div>

                            {current && !completed && (
                              <div className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-[#17479E]">
                                <span
                                  className="h-2 w-2 rounded-full bg-[#FEBC11] motion-safe:animate-pulse motion-reduce:animate-none"
                                  aria-hidden="true"
                                />
                                Reviewing…
                              </div>
                            )}

                            {completed && (
                              <span className="hidden text-sm font-medium text-[#17479E] sm:block">
                                Complete
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {investigationComplete && (
                      <div className="mt-6 space-y-4">
                        <div className="rounded-xl border border-slate-300 bg-white p-5">
                          <div className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">
                            What I noticed
                          </div>

                          <div className="mt-2 text-sm leading-6 text-slate-700">
                            {selectedPatient.agent.whatNoticed}
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-xl border border-[#BFD2EA] bg-[#F7FAFE] p-5">
                            <div className="text-sm font-semibold uppercase tracking-[0.08em] text-[#17479E]">
                              What I know
                            </div>

                            <div className="mt-2 text-sm leading-6 text-slate-700">
                              {selectedPatient.agent.whatKnow}
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-300 bg-slate-50 p-5">
                            <div className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">
                              What I don’t know
                            </div>

                            <div className="mt-2 text-sm leading-6 text-slate-700">
                              {selectedPatient.agent.whatDontKnow}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Button
                        onClick={continueToExplanation}
                        disabled={!investigationComplete}
                        aria-disabled={!investigationComplete}
                        className={
                          investigationComplete
                            ? "min-h-11 bg-[#17479E] px-4 text-sm text-white hover:bg-[#123B82] focus-visible:ring-2 focus-visible:ring-[#17479E] focus-visible:ring-offset-2"
                            : "min-h-11 px-4 text-sm focus-visible:ring-2 focus-visible:ring-[#17479E] focus-visible:ring-offset-2"
                        }
                      >
                        Continue
                        <ArrowRight
                          className="ml-1.5 h-4 w-4"
                          aria-hidden="true"
                        />
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={stopInvestigation}
                        className="min-h-11 text-sm text-slate-700 focus-visible:ring-2 focus-visible:ring-[#17479E] focus-visible:ring-offset-2"
                      >
                        Stop investigation
                      </Button>
                    </div>
                  </div>
                )}

                {/* EXPLAINED */}
                {agentStep === "explained" && (
                  <div className="mx-auto max-w-[760px]">
                    <div className="mb-6">
                    <div className="text-lg font-semibold text-slate-900">
  What I found
</div>

<div className="mt-2 text-sm leading-6 text-slate-600">
  {selectedPatient.agent.findingIntro}
</div>
                    </div>

                    <div className="rounded-xl border border-slate-300 bg-slate-50 p-5">
                      <div className="space-y-4">
                        {selectedPatient.agent.findings.map((item) => (
                          <div
                            key={item}
                            className="flex items-start gap-3"
                          >
                            <div
                              aria-hidden="true"
                              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8F1FB]"
                            >
                              <Check className="h-3.5 w-3.5 text-[#17479E]" />
                            </div>

                            <div className="text-sm leading-6 text-slate-700">
                              {item}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-300 bg-white p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-800">
                          Confidence
                        </div>

                        <span className="rounded-full bg-[#E8F1FB] px-2.5 py-1.5 text-xs font-medium text-[#17479E]">
                          Moderate
                        </span>
                      </div>

                      <div className="mt-3 text-sm leading-6 text-slate-600">
                        The trend is supported by repeated wearable readings,
                        but the available data cannot determine why the change
                        occurred or whether it represents a medical condition.
                      </div>

                      <button
                        type="button"
                        aria-expanded={showSources}
                        aria-controls="agent-evidence"
                        onClick={() => setShowSources(!showSources)}
                        className="mt-4 flex min-h-11 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-[#17479E] hover:bg-[#F4F8FD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17479E]"
                      >
                        {showSources
                          ? "Hide evidence"
                          : "See evidence reviewed"}

                        <ChevronDown
                          className={`h-4 w-4 transition-transform motion-reduce:transition-none ${
                            showSources ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      {showSources && (
                        <div
                          id="agent-evidence"
                          className="mt-3 space-y-2.5 border-t border-slate-200 pt-3"
                        >
                          {selectedPatient.agent.evidence.map((item) => (
                            <div key={item} className="text-sm leading-5 text-slate-700">
                              • {item}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Info
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        Evidence reviewed from connected demo sources
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="ghost"
                          onClick={goBackToInvestigation}
                          className="min-h-11 text-sm text-slate-700 focus-visible:ring-2 focus-visible:ring-[#17479E] focus-visible:ring-offset-2"
                        >
                          <ArrowRight
                            className="mr-1.5 h-4 w-4 rotate-180"
                            aria-hidden="true"
                          />
                          Back
                        </Button>

                        <Button
                          onClick={goToApproval}
                          className="min-h-11 bg-[#17479E] px-4 text-sm text-white hover:bg-[#123B82] focus-visible:ring-2 focus-visible:ring-[#17479E] focus-visible:ring-offset-2"
                        >
                          See recommended next step
                          <ArrowRight
                            className="ml-1.5 h-4 w-4"
                            aria-hidden="true"
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* APPROVAL */}
                {agentStep === "approval" && (
                  <div className="mx-auto max-w-[760px] space-y-4">
                    <div className="rounded-xl border border-[#BFD2EA] bg-[#F7FAFE] p-5 lg:p-6">
                      <div className="flex items-start gap-3.5">
                        <div
                          aria-hidden="true"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"
                        >
                          <ShieldCheck className="h-5 w-5 text-[#17479E]" />
                        </div>

                        <div>
                          <div className="text-sm font-semibold uppercase tracking-[0.08em] text-[#17479E]">
                            Recommended next step
                          </div>

                          <div className="mt-1.5 text-lg font-semibold text-slate-800">
                            {selectedPatient.agent.recommendationTitle}
                          </div>

                          <div className="mt-1.5 text-sm leading-6 text-slate-700">
                            {selectedPatient.agent.recommendationDetail}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-300 bg-white p-5">
                      <div className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">
                        Why I’m recommending this
                      </div>

                      <div className="mt-4 space-y-4">
                        {selectedPatient.agent.recommendationReasons.map((item) => (
                          <div
                            key={item.title}
                            className="flex items-start gap-3"
                          >
                            <div
                              aria-hidden="true"
                              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8F1FB]"
                            >
                              <Check className="h-3.5 w-3.5 text-[#17479E]" />
                            </div>

                            <div>
                              <div className="text-sm font-medium text-slate-800">
                                {item.title}
                              </div>

                              <div className="mt-1 text-sm leading-5 text-slate-600">
                                {item.detail}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
  <div className="flex items-start gap-3">
    <Lock
      className="mt-0.5 h-5 w-5 shrink-0 text-slate-600"
      aria-hidden="true"
    />

    <div>
      <div className="text-sm font-semibold text-slate-800">
        Your approval is required
      </div>

      <div className="mt-1 text-sm leading-5 text-slate-600">
        If you approve, I’ll start a 7-day monitoring plan using your
        connected wearable data. Nothing will be scheduled, changed, or
        shared without your approval.
      </div>
    </div>
  </div>
</div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setAgentStep("explained")}
                        className="min-h-11 border-slate-300 bg-white px-4 text-sm text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#17479E] focus-visible:ring-offset-2"
                      >
                        <ArrowRight
                          className="mr-1.5 h-4 w-4 rotate-180"
                          aria-hidden="true"
                        />
                        Go back
                      </Button>

                      <Button
                        onClick={startMonitoring}
                        className="min-h-11 bg-[#17479E] px-4 text-sm text-white hover:bg-[#123B82] focus-visible:ring-2 focus-visible:ring-[#17479E] focus-visible:ring-offset-2"
                      >
                        Start 7-day monitoring
                        <ArrowRight
                          className="ml-1.5 h-4 w-4"
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                  </div>
                )}

                {/* ACTIVE */}
                {agentStep === "active" && (
                  <div className="mx-auto max-w-[760px] space-y-4">
                    <div className="rounded-xl border border-[#BFD2EA] bg-[#F7FAFE] p-5 lg:p-6">
                      <div className="flex items-start gap-3.5">
                        <div
                          aria-hidden="true"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"
                        >
                          <Check className="h-5 w-5 text-[#17479E]" />
                        </div>

                        <div>
                          <div className="text-sm font-semibold uppercase tracking-[0.08em] text-[#17479E]">
                            Agent action confirmed
                          </div>

                          <div className="mt-1.5 text-lg font-semibold text-slate-800">
                            7-day monitoring is active
                          </div>

                          <div className="mt-1.5 text-sm leading-6 text-slate-700">
                            {selectedPatient.agent.monitoringDetail}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-300 bg-white p-5">
                      <div className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">
                      What I’m monitoring
                      </div>

                      <div className="mt-4 space-y-4">
                        <div className="flex items-start gap-3">
                          <div
                            aria-hidden="true"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F1FB]"
                          >
                            <HeartPulse className="h-4 w-4 text-[#17479E]" />
                          </div>

                          <div>
                            <div className="text-sm font-medium text-slate-800">
                              {selectedPatient.agent.monitoringTitle}
                            </div>

                            <div className="mt-1 text-sm leading-5 text-slate-600">
                              New readings will be compared with your {selectedPatient.agent.monitoringBaseline} personal baseline.
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div
                            aria-hidden="true"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100"
                          >
                            <CalendarDays className="h-4 w-4 text-slate-600" />
                          </div>

                          <div>
                            <div className="text-sm font-medium text-slate-800">
                              Next reassessment · {selectedPatient.agent.nextCheckIn}
                            </div>

                            <div className="mt-1 text-sm leading-5 text-slate-600">
                            The agent will reassess the trend after another 7 days of available
                            readings and let you know if the pattern meaningfully changes.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck
                          className="mt-0.5 h-5 w-5 shrink-0 text-slate-600"
                          aria-hidden="true"
                        />

                        <div>
                          <div className="text-sm font-semibold text-slate-800">
                            Agent action · User approved
                          </div>

                          <div className="mt-1 text-sm leading-5 text-slate-600">
                            Monitoring was started only after you approved the
                            recommended next step.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={closeAgent}
                        className="min-h-11 bg-[#17479E] px-4 text-sm text-white hover:bg-[#123B82] focus-visible:ring-2 focus-visible:ring-[#17479E] focus-visible:ring-offset-2"
                      >
                        Done
                        <Check
                          className="ml-1.5 h-4 w-4"
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-5 py-3.5 lg:px-7">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Lock className="h-4 w-4" aria-hidden="true" />
                You stay in control of agent actions.
              </div>

              <button
                type="button"
                onClick={closeAgent}
                className="min-h-11 rounded-md px-3 text-sm font-medium text-slate-700 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17479E]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}