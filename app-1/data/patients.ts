export type PatientId = "jordan" | "maya" | "alex";

type MetricSignal = {
  label: string;
  icon: "heart" | "clock" | "activity" | "droplet" | "baby" | "pill";
  value: string;
  unit?: string;
  trend?: string;
  detail: string;
  bars: number[];
};

type PrimaryMetric = {
  title: string;
  subtitle: string;
  latest: string;
  latestLabel: string;
  baselineLabel: string;
  baseline: string;
  data: { day: string; value: number; baselineLow: number; baselineHigh: number }[];
  domain: [number, number];
  seriesLabel: string;
  baselineSeriesLabel: string;
  accessibility: string;
};

type AgentStepData = {
  number: number;
  title: string;
  detail: string;
};

type PatientProfile = {
  id: PatientId;
  name: string;
  initials: string;
  status: {
    label: string;
    detail: string;
    watchLabel: string;
    watchDetail: string;
    updated: string;
  };
  medications: {
    name: string;
    dose: string;
    time: string;
    status: string;
    tone: "blue" | "neutral";
  }[];
  appointment: {
    title: string;
    clinician: string;
    dateTime: string;
    location: string;
    preparation: string;
  };
  primaryMetric: PrimaryMetric;
  connectedSignals: MetricSignal[];
  baselines: [string, string][];
  agent: {
    confidence: string;
    insightTitle: string;
    insightDetail: string;
    idleTitle: string;
    idleDescription: string;
    currentValue: string;
    currentUnit: string;
    tags: string[];
    steps: AgentStepData[];
    whatNoticed: string;
    whatKnow: string;
    whatDontKnow: string;
    findingIntro: string;
    findings: string[];
    evidence: string[];
    recommendationTitle: string;
    recommendationDetail: string;
    recommendationReasons: { title: string; detail: string }[];
    monitoringTitle: string;
    monitoringDetail: string;
    monitoringBaseline: string;
    nextCheckIn: string;
  };
};

const jordanHeartRate = [
  ["Sep 5", 57], ["Sep 6", 58], ["Sep 7", 56], ["Sep 8", 57],
  ["Sep 9", 58], ["Sep 10", 57], ["Sep 11", 59], ["Sep 12", 58],
  ["Sep 13", 57], ["Sep 14", 59], ["Sep 15", 58], ["Sep 16", 59],
  ["Sep 17", 57], ["Sep 18", 58], ["Sep 19", 59], ["Sep 20", 58],
  ["Sep 21", 57], ["Sep 22", 58], ["Sep 23", 56], ["Sep 24", 59],
  ["Sep 25", 60], ["Sep 26", 58], ["Sep 27", 57], ["Sep 28", 60],
  ["Sep 29", 61], ["Sep 30", 59], ["Oct 1", 60], ["Oct 2", 61],
  ["Oct 3", 62], ["Oct 4", 62],
].map(([day, value]) => ({
  day: day as string,
  value: value as number,
  baselineLow: 56,
  baselineHigh: 64,
}));

const mayaPregnancy = [
  ["Week 20", 20], ["Week 21", 21], ["Week 22", 22], ["Week 23", 23], ["Week 24", 24],
].map(([day, value]) => ({
  day: day as string,
  value: value as number,
  baselineLow: 20,
  baselineHigh: 24,
}));

const alexGlucose = [
  ["Sep 30", 112], ["Oct 1", 118], ["Oct 2", 124], ["Oct 3", 136], ["Oct 4", 142],
].map(([day, value]) => ({
  day: day as string,
  value: value as number,
  baselineLow: 95,
  baselineHigh: 135,
}));

export const patientProfiles: Record<PatientId, PatientProfile> = {
  jordan: {
    id: "jordan",
    name: "Jordan",
    initials: "JD",
    status: {
      label: "Stable",
      detail: "No urgent signals detected",
      watchLabel: "Agent watching a non-urgent change",
      watchDetail: "Your overall status is stable while the agent reviews a gradual resting heart-rate trend.",
      updated: "12 minutes ago",
    },
    medications: [
      { name: "Lisinopril", dose: "10 mg", time: "8:00 AM", status: "Reminder set", tone: "blue" },
      { name: "Vitamin D", dose: "1000 IU", time: "8:00 AM", status: "Scheduled", tone: "neutral" },
    ],
    appointment: {
      title: "Primary care follow-up",
      clinician: "Dr. Morgan Lee",
      dateTime: "October 18 · 9:30 AM",
      location: "Baylor Scott & White · Virtual",
      preparation: "No preparation required",
    },
    primaryMetric: {
      title: "Resting heart rate",
      subtitle: "personal baseline",
      latest: "62",
      latestLabel: "Latest reading · Oct 4",
      baselineLabel: "Personal baseline",
      baseline: "56–64 bpm",
      data: jordanHeartRate,
      domain: [52, 68],
      seriesLabel: "Resting heart rate",
      baselineSeriesLabel: "Personal baseline",
      accessibility: "Resting heart rate is currently 62 beats per minute. The personal baseline is 56 to 64 beats per minute. The chart shows a gradual increase over the selected time period.",
    },
    connectedSignals: [
      { label: "Resting HR", icon: "heart", value: "57 → 62", unit: "bpm", trend: "↑ Trending", detail: "Gradually increasing over 10 days", bars: [9, 11, 10, 13, 12, 16, 15, 19, 18, 22] },
      { label: "Sleep", icon: "clock", value: "7.8 → 7.1", unit: "hrs", detail: "Gradually below your usual range", bars: [22, 21, 23, 20, 19, 18, 20, 17, 16, 14] },
      { label: "Activity", icon: "activity", value: "Usual → Lower", detail: "Recent activity differs from your usual pattern", bars: [21, 22, 20, 23, 19, 17, 16, 15, 13, 12] },
    ],
    baselines: [["Resting HR", "56–64 bpm"], ["Sleep", "7h 12m"], ["Steps", "7.8k/day"], ["BP", "128/82"]],
    agent: {
      confidence: "Moderate confidence",
      insightTitle: "Your resting heart rate has gradually increased over the last 10 days.",
      insightDetail: "The trend remains within your personal baseline, but the agent found it worth reviewing alongside recent sleep and activity changes.",
      idleTitle: "Resting heart rate is trending upward",
      idleDescription: "Your recent readings have moved from around 57 bpm to 62 bpm. Your personal baseline is currently 56–64 bpm.",
      currentValue: "62",
      currentUnit: "bpm",
      tags: ["Wearable updated 12 min ago", "Personal baseline", "30-day trend"],
      steps: [
        { number: 1, title: "Reviewing resting heart-rate trend", detail: "30 days of wearable data" },
        { number: 2, title: "Reviewing sleep pattern", detail: "Recent sleep duration" },
        { number: 3, title: "Reviewing activity changes", detail: "Recent activity compared with usual" },
        { number: 4, title: "Checking whether the signals overlap", detail: "Looking for changes during the same period" },
      ],
      whatNoticed: "Resting heart rate increased from 57 → 62 bpm while sleep decreased from 7.8 → 7.1 hours and recent activity was lower than usual.",
      whatKnow: "These changes occurred during the same period. The resting heart-rate trend remains within your personal baseline, and no urgent signal appears in the available demo data.",
      whatDontKnow: "The available data cannot determine whether these signals are related or why they changed.",
      findingIntro: "I found a coordinated change across several signals. The pattern is worth watching, but the available data does not establish a medical cause.",
      findings: [
        "Resting heart rate increased from 57 → 62 bpm.",
        "Sleep decreased from 7.8 → 7.1 hours during the same period.",
        "Recent activity was lower than your usual pattern.",
        "The signals changed during the same period, but I cannot determine from the available data why they changed.",
      ],
      evidence: ["Wearable heart-rate readings · Sep 5–Oct 4", "Personal baseline · 56–64 bpm", "Sleep and activity context"],
      recommendationTitle: "Continue monitoring for 7 days",
      recommendationDetail: "Your resting heart rate is still within your personal baseline. Because the change is gradual, continued monitoring is more appropriate than escalating based on the current data alone.",
      recommendationReasons: [
        { title: "The change is gradual", detail: "Your recent readings increased over multiple days rather than changing suddenly." },
        { title: "It remains within your baseline", detail: "Your current personal range is 56–64 bpm." },
        { title: "More data can add context", detail: "Another week of readings can help determine whether the trend continues or returns toward baseline." },
      ],
      monitoringTitle: "Monitoring resting heart rate",
      monitoringDetail: "I’ll watch new resting heart-rate readings, compare them with your personal baseline, and surface a new insight if the pattern meaningfully changes.",
      monitoringBaseline: "56–64 bpm",
      nextCheckIn: "Oct 11",
    },
  },
  maya: {
    id: "maya",
    name: "Maya",
    initials: "MY",
    status: {
      label: "On track",
      detail: "No urgent signals detected",
      watchLabel: "Agent watching pregnancy care",
      watchDetail: "Your pregnancy care is on track while the agent keeps upcoming care and recent maternal signals in view.",
      updated: "18 minutes ago",
    },
    medications: [
      { name: "Prenatal vitamin", dose: "1 tablet", time: "8:00 AM", status: "Reminder set", tone: "blue" },
      { name: "Iron", dose: "27 mg", time: "8:00 AM", status: "Scheduled", tone: "neutral" },
    ],
    appointment: {
      title: "Prenatal visit",
      clinician: "Dr. Priya Shah",
      dateTime: "October 10 · 10:00 AM",
      location: "Baylor Scott & White Women’s Health",
      preparation: "Bring current medication list",
    },
    primaryMetric: {
      title: "Pregnancy progress",
      subtitle: "care milestone",
      latest: "24",
      latestLabel: "Current gestational week",
      baselineLabel: "Care milestone",
      baseline: "Week 24",
      data: mayaPregnancy,
      domain: [19, 25],
      seriesLabel: "Gestational week",
      baselineSeriesLabel: "Care milestone range",
      accessibility: "Maya is currently at week 24 of pregnancy. The chart shows progression from week 20 through week 24.",
    },
    connectedSignals: [
      { label: "Pregnancy", icon: "baby", value: "Week 24", detail: "Entering the next care milestone", bars: [12, 14, 16, 19, 22] },
      { label: "Blood pressure", icon: "heart", value: "118/72", detail: "Within your recent range", bars: [18, 18, 19, 20, 20] },
      { label: "Weight", icon: "activity", value: "+0.8", unit: "lb", detail: "Gradual change since last check", bars: [12, 13, 14, 16, 17] },
    ],
    baselines: [["BP", "118/72"], ["Weight", "+0.8 lb"], ["Pregnancy", "Week 24"], ["Next visit", "Oct 10"]],
    agent: {
      confidence: "High confidence",
      insightTitle: "Your pregnancy care is on track.",
      insightDetail: "You’re entering week 24, with a prenatal visit scheduled this week and your recent blood pressure remaining within your personal range.",
      idleTitle: "Your pregnancy care is on track",
      idleDescription: "You’re entering week 24 of pregnancy, with a prenatal visit scheduled this week and recent blood pressure within your personal range.",
      currentValue: "24",
      currentUnit: "week",
      tags: ["Pregnancy week 24", "Prenatal visit this week", "Recent BP in range"],
      steps: [
        { number: 1, title: "Reviewing pregnancy milestone", detail: "Current gestational week" },
        { number: 2, title: "Reviewing recent blood pressure", detail: "Recent maternal vital signs" },
        { number: 3, title: "Reviewing upcoming prenatal care", detail: "Next scheduled appointment" },
        { number: 4, title: "Checking whether care signals align", detail: "Comparing timing and recent data" },
      ],
      whatNoticed: "You’re entering week 24, your prenatal visit is scheduled this week, and recent blood pressure remains within your personal range.",
      whatKnow: "The available demo data shows pregnancy progression and recent maternal signals aligned with the current care plan.",
      whatDontKnow: "The available data cannot determine whether you have symptoms or concerns that should change your care plan.",
      findingIntro: "Your current pregnancy milestone, recent blood pressure, and upcoming prenatal care are aligned in the available demo data.",
      findings: [
        "You’re entering week 24 of pregnancy.",
        "Your recent blood pressure is 118/72 and remains within your recent range.",
        "A prenatal visit is scheduled for October 10.",
        "The available data does not replace guidance from your prenatal care team.",
      ],
      evidence: ["Pregnancy milestone · Week 24", "Recent blood pressure · 118/72", "Upcoming prenatal visit · Oct 10"],
      recommendationTitle: "Keep your scheduled prenatal visit",
      recommendationDetail: "Your current demo data supports staying on the existing care plan and keeping the upcoming prenatal visit. The agent is not recommending a change based on these signals alone.",
      recommendationReasons: [
        { title: "Your care milestone is current", detail: "The dashboard reflects week 24 of pregnancy." },
        { title: "Recent BP is within range", detail: "The latest demo blood pressure is 118/72." },
        { title: "Your next visit is scheduled", detail: "The prenatal visit is already scheduled for October 10." },
      ],
      monitoringTitle: "Monitoring pregnancy care signals",
      monitoringDetail: "I’ll keep the current pregnancy milestone, recent maternal signals, and upcoming care in context and surface a new insight if something meaningfully changes.",
      monitoringBaseline: "BP 118/72",
      nextCheckIn: "Oct 10",
    },
  },
  alex: {
    id: "alex",
    name: "Alex",
    initials: "AX",
    status: {
      label: "Watching",
      detail: "No urgent signals detected",
      watchLabel: "Agent watching overnight glucose",
      watchDetail: "Your overall status is stable while the agent reviews a recent overnight glucose pattern.",
      updated: "9 minutes ago",
    },
    medications: [
      { name: "Metformin", dose: "500 mg", time: "8:00 AM", status: "Scheduled", tone: "blue" },
      { name: "Metformin", dose: "500 mg", time: "8:00 PM", status: "Scheduled", tone: "neutral" },
    ],
    appointment: {
      title: "Diabetes follow-up",
      clinician: "Dr. Marcus Chen",
      dateTime: "October 15 · 2:00 PM",
      location: "Baylor Scott & White Endocrinology",
      preparation: "Bring recent glucose readings",
    },
    primaryMetric: {
      title: "Overnight glucose",
      subtitle: "personal baseline",
      latest: "142",
      latestLabel: "Latest reading · Oct 4",
      baselineLabel: "Personal baseline",
      baseline: "95–135 mg/dL",
      data: alexGlucose,
      domain: [85, 155],
      seriesLabel: "Overnight glucose",
      baselineSeriesLabel: "Personal baseline",
      accessibility: "Overnight glucose is currently 142 milligrams per deciliter. The personal baseline is 95 to 135 milligrams per deciliter. The chart shows a recent increase.",
    },
    connectedSignals: [
      { label: "Glucose", icon: "droplet", value: "124 → 142", unit: "mg/dL", trend: "↑ Trending", detail: "Overnight readings above baseline", bars: [12, 14, 15, 18, 21, 20, 23, 25, 27, 29] },
      { label: "Time in range", icon: "activity", value: "76 → 69", unit: "%", detail: "Recent readings are less often in range", bars: [25, 24, 23, 22, 20, 19, 18, 17, 15, 14] },
      { label: "Activity", icon: "activity", value: "Usual → Lower", detail: "Recent activity is below your usual pattern", bars: [22, 23, 21, 22, 20, 18, 17, 16, 14, 13] },
    ],
    baselines: [["Overnight glucose", "95–135 mg/dL"], ["Time in range", "76%"], ["A1C", "6.8%"], ["Activity", "7.2k/day"]],
    agent: {
      confidence: "Moderate confidence",
      insightTitle: "Your glucose has been running higher overnight.",
      insightDetail: "Your overnight readings have been above your recent baseline for the past several days while activity has been lower than usual.",
      idleTitle: "Overnight glucose is trending higher",
      idleDescription: "Your recent overnight readings have moved from around 124 mg/dL to 142 mg/dL. Your personal baseline is currently 95–135 mg/dL.",
      currentValue: "142",
      currentUnit: "mg/dL",
      tags: ["Glucose updated 9 min ago", "Personal baseline", "Several-day trend"],
      steps: [
        { number: 1, title: "Reviewing overnight glucose trend", detail: "Recent glucose readings" },
        { number: 2, title: "Reviewing time in range", detail: "Recent glucose distribution" },
        { number: 3, title: "Reviewing activity changes", detail: "Recent activity compared with usual" },
        { number: 4, title: "Checking whether the signals overlap", detail: "Looking for changes during the same period" },
      ],
      whatNoticed: "Overnight glucose increased from 124 → 142 mg/dL while time in range decreased from 76% → 69% and recent activity was lower than usual.",
      whatKnow: "The glucose pattern has been higher overnight for several days and overlaps with lower activity in the available demo data.",
      whatDontKnow: "The available data cannot determine why glucose is higher or whether meals, medication timing, illness, or another factor contributed.",
      findingIntro: "I found a recent overnight glucose pattern that is worth watching. The available data does not establish the cause.",
      findings: [
        "Overnight glucose increased from 124 → 142 mg/dL.",
        "Time in range decreased from 76% → 69% during the same period.",
        "Recent activity was lower than your usual pattern.",
        "The available data cannot determine what caused the change.",
      ],
      evidence: ["Overnight glucose readings · Recent days", "Personal baseline · 95–135 mg/dL", "Time-in-range and activity context"],
      recommendationTitle: "Continue monitoring overnight glucose for 7 days",
      recommendationDetail: "Because the change is recent and the available data does not establish the cause, another week of readings can add context before considering a change in care.",
      recommendationReasons: [
        { title: "The change is recent", detail: "The overnight pattern has shifted over several days rather than one isolated reading." },
        { title: "Readings are above baseline", detail: "Your current personal range is 95–135 mg/dL." },
        { title: "More context can help", detail: "Additional readings alongside activity and other context can clarify whether the pattern persists." },
      ],
      monitoringTitle: "Monitoring overnight glucose",
      monitoringDetail: "I’ll watch new overnight glucose readings, compare them with your personal baseline, and surface a new insight if the pattern meaningfully changes.",
      monitoringBaseline: "95–135 mg/dL",
      nextCheckIn: "Oct 11",
    },
  },
};
