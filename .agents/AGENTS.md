# Ztefu-Immo Design System Rules

These rules must be strictly followed for any new component, page, or feature built for the Ztefu-Immo application to maintain visual consistency, premium aesthetics, and high-quality responsiveness.

## 1. Colors & Themes
- **Page Background**: Light gray `bg-slate-50`.
- **Card & Block Backgrounds**: White `bg-white`.
- **Borders**: Subtle dividers `border border-slate-100` or `border-slate-200`.
- **Typography Colors**:
  - Main titles, key numbers, primary info: `text-slate-900`.
  - Subtitles, labels, secondary info: `text-slate-500` or `text-slate-400`.
- **Accent Colors** (Always use standard hex pairs when needed):
  - **Success/Valid/Occupied**: Green (`text-[#22c55e]`, `bg-[#dcfce7]`).
  - **Info/Revenue**: Blue (`text-[#3b82f6]`, `bg-[#dbeafe]`).
  - **Warning/Pending/Vacant**: Yellow (`text-[#eab308]`, `bg-[#fef08a]`).
  - **Neutral/Users/Tenants**: Purple (`text-[#a855f7]`, `bg-[#f3e8ff]`).

## 2. Shapes & Border Radiuses
- **Large Container Blocks** (e.g. main section wrappers): `rounded-[32px]`.
- **Cards & Data Visualizations**: `rounded-[24px]`.
- **Inner Images / Small Cards**: `rounded-[20px]`.
- **Buttons, Inputs, Badges, Search bars**: `rounded-full` (pill shapes).

## 3. Shadows (Box-Shadow)
Do NOT use default Tailwind shadows indiscriminately. Use the following custom ultra-soft shadows to ensure a premium feel:
- **Default State (Cards, Blocks)**: `shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]`.
- **Hover State (Cards, Blocks)**: `shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)]`.
- **Floating Elements (Tooltips, Modals, Dropdowns)**: `shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)]`.

## 4. Animations & Micro-interactions
The interface must feel alive and dynamic.
- **Card/Block Hover Effects**: Always add elevation and shadow enhancement.
  ```tsx
  className="hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300"
  ```
- **Button Hover/Tap Effects**: Use `framer-motion` for primary call-to-actions.
  ```tsx
  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  ```
- **Page/Section Load Animations**: Wrap major sections in `framer-motion` divs with stagger delays.
  ```tsx
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.5, delay: 0.1 }}
  >
  ```

## 5. Typography & Alignments
- **Main Page Titles**: `text-[28px] font-bold tracking-tight`.
- **Section Titles**: `text-[17px]` to `text-[20px] font-bold`.
- **Key Metrics/Numbers**: `text-[32px] font-bold leading-none`.
- Use Flexbox (`flex items-center justify-between gap-X`) extensively for layouts rather than specific margins (`ml`, `mt` etc. should be avoided when `gap` can do the job).

## 6. Responsiveness (Mobile First)
- Convert complex flex layouts to stacked columns on mobile (`flex-col sm:flex-row`).
- Grids must gracefully degrade (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
- Ensure all interactive elements (buttons, inputs) are easily reachable and do not overflow off-screen on a `375px` width device.
