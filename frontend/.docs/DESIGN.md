---
name: Artisanal Nutrition System
colors:
  surface: '#fdf9f4'
  surface-dim: '#ddd9d5'
  surface-bright: '#fdf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ee'
  surface-container: '#f1ede8'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e6e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#4f453e'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f4f0eb'
  outline: '#81756d'
  outline-variant: '#d3c4ba'
  surface-tint: '#755843'
  primary: '#321d0c'
  on-primary: '#ffffff'
  primary-container: '#4a321f'
  on-primary-container: '#bc9a81'
  inverse-primary: '#e5bfa5'
  secondary: '#845326'
  on-secondary: '#ffffff'
  secondary-container: '#febc85'
  on-secondary-container: '#78491d'
  tertiary: '#1f2314'
  on-tertiary: '#ffffff'
  tertiary-container: '#343928'
  on-tertiary-container: '#9ea38c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc3'
  primary-fixed-dim: '#e5bfa5'
  on-primary-fixed: '#2b1706'
  on-primary-fixed-variant: '#5b412d'
  secondary-fixed: '#ffdcc2'
  secondary-fixed-dim: '#fab983'
  on-secondary-fixed: '#2e1500'
  on-secondary-fixed-variant: '#683c11'
  tertiary-fixed: '#e0e5cc'
  tertiary-fixed-dim: '#c4c9b1'
  on-tertiary-fixed: '#191d0e'
  on-tertiary-fixed-variant: '#444937'
  background: '#fdf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e6e2dd'
typography:
  headline-xl:
    fontFamily: Epilogue
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
  headline-lg:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The design system is rooted in the "farm-to-bowl" philosophy, emphasizing the organic and artisanal quality of premium animal feed. The brand personality is **nurturing, authoritative, and grounded**. It bridges the gap between traditional agricultural reliability and modern e-commerce convenience.

The visual style is **Corporate / Modern with Tactile influences**. While the core structure remains professional and grid-aligned to ensure trust, the aesthetic incorporates soft, organic textures and a warm color palette that mimics the wood-carved texture of the brand's identity. This approach avoids the clinical feel of standard tech applications, opting instead for a UI that feels as natural and wholesome as the ingredients in the products.

Targeting discerning pet owners and livestock managers, the UI evokes a sense of calm and reliability through high-quality photography, generous whitespace, and soft-edged containers.

## Colors

The color palette is derived directly from the wood-carved logo and the organic environments where animals thrive.

*   **Primary (Deep Timber):** A rich, dark wood brown used for typography and high-priority branding elements to establish authority.
*   **Secondary (Terracotta):** A warm, toasted earth tone used for primary actions, accents, and highlighting organic quality.
*   **Tertiary (Sage Leaf):** A muted green that provides a natural contrast, used primarily for success states, badges, and "natural" product callouts.
*   **Neutral (Cream Linen):** The base of the application. Instead of pure white, this creamy beige reduces eye strain and reinforces the traditional, tactile feel of the brand.
*   **Functional Grays:** Warm-toned grays used for borders and secondary text to maintain harmony with the primary browns.

## Typography

This design system utilizes a pairing of two distinct typefaces to balance character with utility. 

**Epilogue** is used for headlines. Its geometric yet slightly quirky personality mimics the bold, carved lettering seen in the logo, providing a distinctive editorial feel to product names and section titles.

**Work Sans** serves as the workhorse for body text, inputs, and navigational labels. Its grounded, reliable architecture ensures maximum legibility across all device sizes, maintaining the professional standard required for an e-commerce platform. 

Hierarchy is established through weight and color (using Deep Timber for headlines and a slightly lighter Cocoa-Gray for body text) rather than extreme size shifts.

## Layout & Spacing

The design system employs a **Fixed Grid** model for desktop experiences, centering content within a 1280px max-width container to maintain a focused, premium shopping experience.

*   **Grid:** A 12-column grid with 24px gutters.
*   **Rhythm:** An 8px base unit drives all spacing decisions, ensuring a consistent vertical rhythm.
*   **Negative Space:** Large margins (48px to 80px) are used between major sections to prevent the interface from feeling cluttered, reinforcing the "clean and natural" aesthetic.
*   **Mobile:** On smaller screens, the layout shifts to a fluid 4-column grid with 16px margins.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **Ambient Shadows** and **Tonal Layers**. 

The system avoids harsh black shadows in favor of "tinted" shadows—using a low-opacity version of the Primary Deep Timber color. This makes elements appear to be gently resting on the Cream Linen surface rather than floating in a digital void.

*   **Level 1 (Surface):** Cream Linen (#FAF6F1).
*   **Level 2 (Cards):** Pure White (#FFFFFF) with a very soft, 8px blur shadow. Used for product cards and navigation bars.
*   **Level 3 (Popovers/Modals):** Pure White with a 24px blur shadow, creating a distinct separation for interactive layers.

Interactions are signaled through subtle depth changes; for example, a button may "lift" slightly (shadow increases) on hover, or a card might use a 1px soft border in a warm gray to define its boundary without adding heavy visual weight.

## Shapes

The shape language is friendly and organic, avoiding sharp corners to reflect the rounded, circular nature of the brand's logo.

*   **Standard Elements:** Buttons, input fields, and tags use a `0.5rem` (8px) radius.
*   **Large Containers:** Product cards and section blocks use a `1rem` (16px) radius.
*   **Specialty Elements:** Interactive chips or "Best Seller" badges utilize a pill-shape (`2rem`+) to differentiate them from functional inputs.

Iconography should follow a "Line-Art" style with rounded terminals and a consistent 2px stroke weight to match the cleanliness of the Work Sans typeface.

## Components

The components in this design system prioritize tactile feedback and clarity.

*   **Buttons:** Primary buttons are solid Terracotta (#C68B59) with white text. Secondary buttons use a Deep Timber outline with a transparent background. All buttons have a subtle 2px vertical offset shadow to give them a "pressable" look.
*   **Product Cards:** These feature a white background, the standard 16px corner radius, and a soft tinted shadow. The product image should be centered, ideally with a natural, lifestyle background.
*   **Inputs:** Form fields use the Cream Linen background with a 1px border in a warm gray. On focus, the border transitions to Terracotta with a soft outer glow.
*   **Chips & Badges:** Used for categories (e.g., "Grain-Free," "High Protein"). These utilize the Tertiary Sage Green with low opacity backgrounds and dark green text.
*   **Navigation:** A clean, sticky top bar with a centered logo. Links use Work Sans in Deep Timber, transitioning to Terracotta on hover with a soft underline.
*   **Quantity Selectors:** A custom component with large "plus" and "minus" touch targets, essential for bulk feed orders.