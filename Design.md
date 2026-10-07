# HealthOS Design System

## Product design direction

HealthOS is a patient-centered, AI-native healthcare experience designed to help people understand their health, notice meaningful changes, and decide what to do next.

The visual language should feel:

- Calm
- Clinical
- Trustworthy
- Human
- Premium
- Clear
- Reassuring without being passive

HealthOS should prioritize readability and comprehension over information density.

The interface should not feel like a clinical monitoring console or enterprise analytics dashboard. Patients should be able to understand the most important information quickly, even when they are older adults, have reduced vision, or are under stress.

---

## Brand palette

HealthOS uses a Baylor Scott & White-inspired visual language for this independent portfolio concept.

### Primary

- Navy Blue: `#17479E`
- Dark Navy: `#123B82`

Primary brand identity, agent identity, primary actions, selected states, and important interactive elements.

### Secondary

- Bondi Blue: `#0090BA`

Secondary interaction, links, data visualization, informational states, and supporting actions.

### Attention

- Gold: `#FEBC11`

Agent activity, attention states, highlights, and non-urgent changes.

Gold should not be relied upon as the sole indicator of meaning.

### Neutrals

Use slate-based neutrals for text, surfaces, borders, and supporting UI.

Important patient-facing information should use sufficiently dark text rather than light gray.

---

## Accessibility philosophy

HealthOS is designed toward WCAG 2.2 AA, with selected AAA-level practices for typography, contrast, touch targets, and readability.

Accessibility is treated as a core product requirement rather than a final compliance pass.

The primary audience includes patients who may:

- Be older adults
- Have reduced visual acuity
- Have difficulty distinguishing low-contrast elements
- Use keyboard navigation
- Use touch interfaces
- Be viewing the product while stressed or distracted

Readability takes precedence over dense information presentation.

---

## Typography

Meaningful patient-facing text should never depend on extremely small type.

### Minimum guidance

- Avoid 9px and 10px text for meaningful content.
- Use 11px only for extremely limited metadata when necessary.
- Prefer 12–14px for supporting information.
- Prefer 14–16px for body content.
- Use 16px or larger for important patient-facing explanations.
- Use larger type for primary health values and key status information.

Typography should have sufficient line height to support scanning and comprehension.

### Recommended hierarchy

| Purpose | Recommended size |
|---|---:|
| Primary page title | 24–32px |
| Section heading | 18–22px |
| Card heading | 16–18px |
| Primary body | 14–16px |
| Supporting body | 13–14px |
| Metadata | 12–13px |
| Minimum meaningful text | 12px |

Do not reduce text size simply to make more information fit.

---

## Color and contrast

Important information must remain readable without relying on subtle gray text.

Prefer:

- `slate-900` for primary text
- `slate-700` for secondary text
- `slate-600` for supporting information
- `slate-500` only for genuinely low-priority metadata

Avoid using `slate-400` for important patient-facing content.

Borders should provide enough visual separation to identify cards, controls, and sections.

Prefer `slate-200` or stronger borders when a boundary is important to understanding the interface.

Color should never be the only way information is communicated.

Important states should combine:

- Color
- Text
- Iconography or another visual indicator

---

## Touch targets

Interactive controls should be comfortable for touch use.

Target:

- At least 44 × 44px for primary interactive controls.
- Prefer 44px or larger for buttons and navigation controls.
- Avoid tightly packed controls that require precision tapping.

Spacing between adjacent interactive controls should also make accidental activation unlikely.

---

## Focus and keyboard interaction

All interactive controls should have a clearly visible focus state.

Focus indicators should:

- Have strong contrast
- Be visible against both light and dark surfaces
- Not rely solely on subtle color changes
- Remain visible during keyboard navigation

Keyboard users should be able to reach all meaningful interactive controls in a logical order.

---

## Motion

Motion should communicate state changes rather than decorate the interface.

Animations should be:

- Short
- Purposeful
- Calm
- Non-distracting

The interface should respect `prefers-reduced-motion`.

Users who request reduced motion should not receive unnecessary animated transitions or pulsing effects.

---

## Healthcare trust

HealthOS should clearly distinguish between:

### What the system knows

Observed data, measurements, appointments, medications, and connected-device information.

### What the agent infers

Patterns, trends, correlations, or possible explanations.

### What the agent does not know

Information that cannot be determined from available data.

### What the agent recommends

A proposed next step that requires appropriate patient approval when consequential.

### What the patient approved

An explicit action that the patient has authorized.

This distinction is critical for healthcare trust.

---

## Agent interaction principles

The HealthOS agent should:

1. Observe
2. Investigate
3. Explain
4. Show evidence
5. Communicate uncertainty
6. Recommend proportionately
7. Ask for approval when appropriate
8. Execute only after approval
9. Show progress
10. Confirm completion

The agent should not create unnecessary alarm from a single abnormal measurement.

---

## Status design

Status should use multiple signals rather than color alone.

Examples:

### Stable

Use neutral or positive styling with explicit text:

`Stable`

### Watching

Use Gold plus explicit text:

`Agent watching`

### Action required

Use stronger visual emphasis plus explicit text:

`Action recommended`

### Urgent

Use appropriate high-contrast warning treatment and explicit language.

Do not use color alone to communicate urgency.

---

## Data visualization

Charts should prioritize comprehension over decoration.

Charts should:

- Use readable labels
- Provide meaningful units
- Clearly identify the user's personal baseline
- Avoid relying on color alone
- Provide supporting text when interpretation matters
- Avoid excessive visual density

Personal baselines should be visually distinguishable from measured values.

---

## Content principles

Health language should be:

- Plain
- Direct
- Calm
- Non-alarming
- Specific about uncertainty

Prefer:

> Your resting heart rate has gradually increased over the last 10 days.

Avoid:

> Abnormal cardiovascular trend detected.

Prefer:

> The available data cannot determine why this changed.

Avoid:

> Cause unknown.

The product should explain enough for a patient to understand why something matters without overwhelming them.

---

## Portfolio positioning

HealthOS is an independent portfolio concept and is not an official Baylor Scott & White product.

Patient data shown in the prototype is fictional and illustrative.

Accessibility claims should describe the design intent and process accurately.

Use:

> Designed toward WCAG 2.2 AA, with selected AAA-level accessibility practices for readability, contrast, touch targets, and low-vision users.

Do not claim formal WCAG certification or compliance unless the product has undergone an appropriate accessibility evaluation.