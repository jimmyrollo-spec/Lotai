# DESIGN_SYSTEM.md

This file is the visual contract for the product. Future AI-assisted changes must extend this system instead of inventing parallel styles.

## Brand posture

Premium property intelligence: institutional credibility + modern geospatial/data product + plain-English homeowner usability.

Avoid:
- neon / purple AI gradients
- glassmorphism as a primary surface language
- giant generic SaaS hero whitespace
- stock-house / hardhat photography
- cartoon construction illustrations
- over-rounded cards
- fake trust badges, customer counts or testimonials
- black-box “AI score” language
- dense government-portal styling

## Core palette

- Ink 950: `#07111c` — primary dark / authority background
- Ink 900: `#0b1724`
- Ink 800: `#122235`
- Ink 700: `#20344a`
- Slate 600: `#516477`
- Slate 500: `#6d7f90`
- Slate 400: `#91a0af`
- Slate 300: `#b9c4cf`
- Slate 200: `#d9e0e7`
- Slate 100: `#edf1f4`
- Paper: `#f7f6f2`
- White: `#ffffff`
- Primary accent: `#18c79a`
- Accent dark: `#0c8f70`
- Accent soft: `#dbf8ef`
- Secondary data blue: `#5f8cff`
- Warning: `#d8922d`
- Danger: `#b8584e`

Green means a supported/positive check, not legal approval. Warning means verify/review. Never rely on color alone.

## Typography

- UI / display: Manrope via `next/font`
- Data / labels: IBM Plex Mono via `next/font`
- Large headings use tight tracking, restrained weight, short line lengths.
- Body copy is 0.82–1.08rem depending context with 1.6–1.8 line height.
- Use mono only for source metadata, system status, evidence labels, dimensions and technical metadata.

## Layout

- Max content shell: 1240px
- Desktop outer gutter: 24px minimum
- Mobile outer gutter: 12px minimum
- Primary section vertical rhythm: 112px desktop / 80px tablet
- Workspace uses tighter vertical rhythm and compact evidence surfaces.

Breakpoints currently encoded in global CSS:
- Desktop: >1100px
- Compact desktop/tablet: <=1100px
- Tablet/mobile: <=820px
- Small mobile: <=560px

## Shape / elevation

- Radius small: 10px
- Radius medium: 16px
- Radius large: 22px
- Prefer thin borders over heavy shadows.
- Shadows communicate elevation only; they are not decoration.

## Motion

- Subtle 150–200ms hover/position transitions only.
- No looping decoration.
- Honor `prefers-reduced-motion`.

## Maps / site plans

Visual hierarchy:
1. authoritative/selected parcel boundary
2. setback/buildable envelope
3. existing footprint
4. proposed project
5. constraints/overlays

Never show highly precise geometry when the source is approximate. Geometry certainty and regulatory certainty are separate concepts.

## Component rules

Reuse existing classes/components before creating new ones. If a pattern appears 2+ times and has interaction/state, extract it. Do not create alternate button, card, badge or input systems unless this file is intentionally updated.

## Accessibility

- WCAG AA contrast minimum
- 44px preferred touch targets for primary mobile actions
- visible keyboard focus
- semantic headings and form labels
- status cannot rely only on color
- reduced motion supported

## Public-data honesty

Prototype/demo outputs must be visibly labeled. Do not make a demo source look like a live official citation. No fake certifications, partners or reviews.
