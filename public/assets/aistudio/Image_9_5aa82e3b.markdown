---
name: Academic Precision
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2151da'
  primary: '#0037b0'
  on-primary: '#ffffff'
  primary-container: '#1d4ed8'
  on-primary-container: '#cad3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#623c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#825100'
  on-tertiary-container: '#ffcb8f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system embodies academic rigor merged with modern digital utility. Designed for students, faculty, and lab administrators, it facilitates seamless scheduling of high-performance computing labs, specialized equipment, and study spaces.

The visual style is **Corporate / Modern** with subtle technical cues. It relies on clean, high-contrast surfaces, meticulous alignment, and intuitive affordances that eliminate ambiguity during time-sensitive reservation windows. The aesthetic feels deliberate, dependable, and swift, conveying institutional authority without the friction of legacy campus portals.

## Colors

The palette leverages contrast to communicate system states, lab availability, and hierarchy immediately:

- **Primary (`#1D4ED8`)**: Deep Tech Indigo serves as the anchor for primary interactions, selected states, progress indicators, and active navigation items.
- **Secondary (`#10B981`)**: Emerald Green denotes positive statuses: open slots, confirmed bookings, operational workstations, and active check-ins.
- **Tertiary (`#F59E0B`)**: Warm Amber manages cautionary states: pending approvals, waitlists, approaching reservation cutoffs, and maintenance alerts.
- **Neutral Dark (`#0F172A`, `#1E293B`)**: Rich slate tones provide high-contrast legibility for primary headers, data points, and terminal-grade body copy.
- **Neutral Light & Surface (`#FFFFFF`, `#F8FAFC`, `#F1F5F9`)**: Layered slate tints separate background canvas from interactive cards, preventing visual fatigue under prolonged mobile use.
- **Borders & Dividers (`#E2E8F0`)**: Low-contrast outlines enforce containment without clutter.

## Typography

Plus Jakarta Sans is utilized across all typographic roles. Its clean geometry, open counters, and sturdy x-height provide exceptional legibility on compact displays, particularly when scanning tabular lab schedules, machine configurations, and timestamp data.

Numbers and time indicators should consistently render with tabular figures (`tnum`) enabled to prevent layout shifting during dynamic countdowns or schedule adjustments. Technical software tags and terminal specifications use `label-sm` or `label-md` with semi-bold weights for rapid legibility.

## Layout & Spacing

The layout is built on a **fluid mobile grid** with strict column rhythm:

- **Mobile Viewport (< 600px)**: 4-column fluid layout with a baseline horizontal margin of `1rem` (16px) and gutters of `1rem` (16px). Interactive targets maintain a minimum vertical touch area of 44px.
- **Tablet Viewport (600px - 1024px)**: 8-column layout with `1.5rem` (24px) gutters and margins, reflowing single-column lab lists into 2-column card grids.
- **Desktop/Admin Viewport (> 1024px)**: 12-column layout capped at 1200px max-width, maintaining centered alignment.

Spacing scales incrementally via an 8pt base grid (with a 4pt micro-step at `space-xs`). Component padding maintains strict proportional hierarchy: tight grouping for badges (`space-xs` vertical, `space-sm` horizontal), medium breathing room for cards (`space-md`), and structural breaks between flow sections (`space-xl`).

## Elevation & Depth

This system uses a **tactile layered approach** that mixes soft ambient shadows with precise borders:

- **Base Layer (Level 0)**: The main application canvas rests on `#F8FAFC`.
- **Card / Surface (Level 1)**: Primary cards use pure white (`#FFFFFF`) with a 1px solid border in `#E2E8F0` and an ambient drop shadow: `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Interactive Elevated / Floating (Level 2)**: Sticky booking footers, active filters, and floating capacity summaries elevate with: `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Modals / Sheets / Popovers (Level 3)**: Stepped reservation drawers and confirmation sheets sit over a 40% opacity slate scrim (`rgba(15, 23, 42, 0.40)`), using: `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08)`.

## Shapes

The interface adopts a **Rounded** shape language:

- **Standard Containers (`0.5rem` / 8px)**: Used for text input fields, time-picker slots, capacity selector buttons, and secondary controls.
- **Cards & Sheets (`1rem` / 16px)**: Applied to laboratory cards, bottom sheet containers, stepped forms, and modal dialogs.
- **Pill Badges (`9999px`)**: Reserved strictly for software tags (e.g., "AutoCAD", "Python", "MATLAB"), machine operational indicators, and dynamic state chips ("Disponível", "Em análise").

## Components

### Buttons
- **Primary**: Solid `#1D4ED8` background, `#FFFFFF` label, height 48px, fully rounded (8px radius), bold typography. Pressed state deepens to `#1E40AF`.
- **Secondary / Subtle**: `#F1F5F9` background with `#1E293B` text, 1px `#E2E8F0` border.
- **Destructive**: Pale red tinted background (`#FEF2F2`) with crimson text (`#DC2626`) for reservation cancellations.

### Badges & Pill Chips
- **Software Badges**: Rendered with `#F1F5F9` background, `#334155` text, and border radius `9999px`. For highlighted software (e.g., GPUs or specialized suites), apply a faint primary wash (`#EFF6FF`) with `#1D4ED8` text.
- **Status Indicators**: "Disponível" renders with `#ECFDF5` background, `#047857` text, and a 6px solid `#10B981` dot prefix. "Pendente" uses `#FFFBEB` background and `#B45309` text.

### Reservation Cards
- White `#FFFFFF` background, 16px padding, 12px border radius, `#E2E8F0` outline. Top row holds the lab name and real-time status pill. Middle section contains capacity counters and software chips. Bottom row shows time availability and a direct "Reservar" CTA.

### Stepped Forms & Timeline
- Stepper displayed horizontally with a 2px track. Completed steps fill with `#1D4ED8`; future steps remain muted `#CBD5E1`. Step headers provide explicit Portuguese context (e.g., "1. Seleção de Horário", "2. Recursos", "3. Confirmação").

### Time Slot Pickers & Capacity Counters
- **Time Slots**: Rendered as a horizontal scrolling strip or 3-column segmented grid. Selected slot activates `#1D4ED8` fill with white text; disabled/booked slots are crossed out with `#94A3B8` text and `#F1F5F9` background.
- **Capacity Counter**: Segmented increment/decrement control with tactile buttons (`+` / `-`) flanking a fixed-width numerical counter.

### Bottom Navigation
- Fixed mobile navigation bar, `#FFFFFF` background with subtle top border (`#E2E8F0`). Icons are 24px paired with `label-sm` text. Active navigation item is `#1D4ED8`; inactive items rest at `#64748B`. Standard tabs: "Início", "Laboratórios", "Minhas Reservas", "Perfil".