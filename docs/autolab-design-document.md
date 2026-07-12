# Autolab — Design System & UX Specification

**Direction:** Modern, minimal SaaS · light + dark mode · accent color grounded in automotive signal language
**Audience:** Auto service shop staff (СТО) in Ukraine + their clients, booking online
**Document scope:** Visual language, page-by-page UX, the two new flows (printable job report, client self-booking), and the schema implications of those flows.

---

## 1. Direction & Rationale

Autolab is operational software — mechanics and shop managers will live in it for a full shift, and clients will hit a thin slice of it from their phone to book an appointment. The design needs to read as **calm, dense, and legible** for the staff side, and **fast and trustworthy** for the client side.

Rather than reaching for a generic SaaS palette, the system borrows its accent vocabulary from the one thing every car has: **signal and warning lights**. Turn signals, hazard lights, the "service due" icon on a dash — these are universally understood as status, which is exactly what this app needs to communicate constantly (booking status, employee status, slot availability). That's the seed for the signature element in §3.

---

## 3. Signature Element: Status Lights

Every status-bearing object in Autolab (booking, employee active/inactive, available/unavailable slot) is represented by a small **dashboard-style indicator light**: a filled circle, 8px, with a soft outer glow matching its color, plus a short label.

```
●  Заплановано     (warning, steady)
●  В роботі        (info, soft pulse animation)
●  Виконано        (success, steady)
●  Скасовано       (danger, dim/desaturated, no glow)
```

This one motif repeats across the calendar (event chip dot), the booking table (status column), the employee list (active/inactive), and the client-facing slot picker (open slot = soft green dot, taken = grey dot) — giving the whole app one consistent, recognizable visual thread without it being decorative. It is the single "signature" risk this system takes; everything else stays quiet and standard SaaS grammar.

---

## 4. App Shell (Admin/Staff Side)

- **Sidebar** (240px, collapsible to 64px icon rail): org switcher at top (logo + name + chevron → dropdown of orgs, persisted choice), nav grouped as *Огляд → Календар, Працівники, Клієнти, Послуги, Авто*, account/profile pinned at bottom with light/dark toggle.
- **Topbar**: breadcrumb/page title (Space Grotesk), search (⌘K — make it functional, see Known Gaps), notification bell, avatar menu.
- **Content area**: max-width constrained on form-heavy pages (960px), full-bleed on calendar/table pages.
- **Theme toggle** lives in the sidebar footer and the public booking header — sun/moon icon, instant switch, no flash (respect `prefers-color-scheme` on first load).

---

## 5. Page Specifications — Admin Side

### 5.1 Auth (`/auth/sign-in`, `/auth/sign-up`, `/sign-up/approve`)
Centered single card (420px) on `bg-canvas`, no sidebar. Logo + short line of copy above the form. Google OAuth button first (full width, outline style), divider "або", then email/password. Verification screen is a single calm state: icon, "Перевірте пошту", resend action.

### 5.2 Dashboard Home (`/dashboard`)
Currently a placeholder — spec it as a real landing: 4 KPI cards (bookings today, in progress, revenue this week, new clients) using `text-secondary` labels + large Space Grotesk numbers; a "Сьогодні" agenda list (today's bookings, status lights, click-through to booking); empty state if no org selected ("Оберіть або створіть організацію").

### 5.3 Account Settings (`/dashboard/account/settings`)
Tabbed layout, tabs in a horizontal pill row under the page title: **Профіль · Акаунт · Організації · Авто · Записи** (last tab is new — see §6.3). Each tab is a simple stacked form layout, label-above-input, save button bottom-right, sticky on scroll for long forms.

### 5.4 Organization Pages
All five (`Employees`, `Clients`, `Services`, `Vehicles`, `Calendar`) share one layout pattern: page title + primary "+" action top-right, filter/search bar, then a data table or calendar.

- **Employees:** table with avatar, name, role badge (color-coded by role, not status), active/inactive status light, hire date. Row click opens side-sheet for edit.
- **Clients:** table with name, phone (monospace), vehicle count, "added" date. Row click → client detail side-sheet with their vehicles + booking history.
- **Services:** simple card-grid (not table) — title, price (monospace, large), duration chip. Card click opens edit modal. Card-grid chosen here specifically because services are a small, browsable catalog, not a dense record set.
- **Vehicles:** table with brand icon, make/model/year, plate (monospace pill), owner (client or "Особистий"), last service date.
- **Calendar:** full month/week/day/agenda view (existing react-big-calendar-style pattern is fine). Event chips show status light + time + vehicle plate + service count. Drag-and-drop reschedule keeps existing interaction; cancelled bookings filtered out by default with a toggle to reveal them.

### 5.5 Vehicle Detail (`/dashboard/vehicles/[vehicleId]`)
Header block: brand icon large, make/model/year as Space Grotesk title, plate + VIN as monospace chips. Spec sheet below in a 2-column key/value grid. Booking history as a vertical timeline (status light per entry, date, services performed, price), each entry linking to that booking's detail/print view (§5.6).

### 5.6 Booking Detail & Job Completion / Print View — **NEW**

This is the page that didn't exist in the previous build. Two states of the same record:

**A. Booking detail (screen view)** — opens from calendar or vehicle history. Header: status light + status label + a status-change control (staff can move Pending → In Progress → Completed/Cancelled). Body: vehicle block, client block, assigned technician, itemized services table (title, duration, price), total. Notes field. Footer action bar: **"Друкувати акт виконаних робіт"** (Print job completion report) — enabled once status is `COMPLETED`; "Редагувати"; "Скасувати запис".

**B. Printable work order (`/dashboard/bookings/[bookingId]/print`)** — a dedicated print-optimized route, not a modal, so it opens cleanly in a new tab and uses `window.print()`. Spec:

- A4 portrait, white background, black/graphite text only — no accent fills, ink-economical.
- Header: organization logo + name + address/phone/email (left), document title **"Акт виконаних робіт"** + booking ID + date (right).
- Two-column info block: client (name, phone) | vehicle (make/model/year, plate, VIN, odometer if captured).
- Itemized services table: № · Послуга · Тривалість · Ціна, with a totals row.
- Technician name + a signature line (blank rule, "Підпис виконавця") and a client signature line ("Підпис клієнта") side by side near the bottom — this is a physical handoff document, so it needs to function on paper.
- Thin accent rule (`accent`, 2px) under the header only — the one permitted color on an otherwise monochrome page.
- A small QR code bottom-right linking back to the booking's online record (nice-to-have, not blocking).
- `@media print` rules: hide app shell entirely, remove shadows/radius, force `12pt`-equivalent type, single page fit for typical bookings (1–6 service lines).

---

## 6. Client-Facing Booking Portal — **NEW**

This is a second, public-facing surface of the product: a client picks an organization, picks a service, sees real open slots, and books — without needing staff to touch the calendar. Visually it's warmer and simpler than the admin shell: no sidebar, generous spacing, mobile-first (most bookings will happen on a phone).

### 6.1 Flow

```
Org public page  →  Choose service(s)  →  Choose date & time  →  Confirm details  →  Confirmation
  /book/[orgSlug]      (multi-select,        (calendar/grid of      (name, phone,        (status light:
                        running total of      open slots, grouped    pre-filled if         "Заплановано",
                        price + duration)     by day; greyed-out     logged in)            add-to-calendar,
                                              slots are taken)                              link to "Мої записи")
```

- **Org public page** (`/book/[orgSlug]`): logo, cover/photo if available, name, address with embedded map (Leaflet/OSM, matches existing integration), short description, services teaser, prominent "Записатись" CTA.
- **Service selection**: checkbox cards (reuses the service card pattern from §5.4 but client-facing copy), sticky summary bar showing total price + total duration as selections change.
- **Slot picker**: a day-strip (horizontally scrollable dates) + a grid of time slots for the selected day. Each slot is a small status-light button: open slots use the `success` light state and are tappable; taken/unavailable slots are shown dim/disabled. Slot length is derived from the summed duration of selected services.
- **Details step**: if the visitor is logged in, name/phone pre-fill from their Profile and only need confirming; if not, a lightweight name + phone form (no password required to book — see §6.3 on what this creates).
- **Confirmation**: status light "Заплановано" (Pending), summary card, "Додати в календар" (.ics download), and — if logged in — a link to **Мої записи**.

### 6.2 "Мої записи" (My Appointments) — new account settings tab

Added as a 5th tab in Account Settings (§5.3): a flat list of the user's bookings **across every organization they've booked with**, each row showing org name/logo, status light, date, vehicle, total price. This is the client-side mirror of the staff calendar — same status-light language, reused component.

### 6.3 What booking actually configures (data model note)

Booking as a client doesn't just create a `Booking` row — it's the moment a `User` becomes known to an `Organization`. Recommended behavior, consistent with the existing schema:

- On first booking with a given org, the system creates a `Client` row scoped to that `organizationId`, with `userId` set to the logged-in user (mirroring how `Employee` links a `User` to an `Organization` on the staff side — `Client` becomes the equivalent link on the customer side).
- If the visitor isn't logged in, the `Client` is created with `userId: null` (a guest record, same as a client added manually by staff today) — and can be claimed/linked later if they create an account with the matching phone number.
- The new `Booking` is created with `status: PENDING`, linked to a `Vehicle` (existing or newly added in the details step) and to the selected `Service[]`.

**Schema gap to flag for engineering:** the current schema has no concept of *working hours* or *technician availability* — `Employee.startDate/endDate` only cover employment duration, not a weekly schedule. To compute real open slots for the picker in §6.1, the team will need either an `Organization`-level weekly hours table or a per-`Employee` schedule, plus a simple overlap check against existing `Booking` time ranges. This isn't a visual-design concern, but it directly determines what the slot grid can honestly show, so it's worth resolving before this flow is built for real (a Lovable mockup can fake it with static availability data in the meantime).

---

## 7. Shared Component Library

| Component | Spec |
|---|---|
| Button | Primary = solid `accent`, white text, 6px radius. Secondary = outline `border-subtle`. Destructive = outline `danger`, fills solid on hover. |
| Status light + label | Per §3 — single source of truth component, used everywhere a status appears. |
| Role badge | Pill, `accent-soft` background, role label, no light (roles aren't status). |
| Data table | Sticky header, 13px Inter body, monospace for IDs/plates/VIN/prices, row hover = `bg-canvas` tint, row click opens side-sheet (not full navigation) for quick edits. |
| Side-sheet | Slides from right, 420px, used for quick edit/detail (employee, client, vehicle) without leaving the list context. |
| Empty state | Icon (outline, `text-secondary`), one-line explanation, primary action button — written as an invitation to act, per the interface's own voice (e.g. "Ще немає клієнтів — додайте першого"). |
| Toast | Bottom-right, action-named ("Запис створено", not "Успіх"), auto-dismiss 4s. |

---

## 8. Responsive, Accessibility, Motion

- **Breakpoints:** sidebar collapses to icon rail < 1024px, fully hidden behind a hamburger < 768px. Tables on the staff side scroll horizontally on mobile rather than reflowing (these are work tools, used mostly on desktop/tablet in-shop). The client booking flow, inversely, is designed mobile-first and only gains a wider centered column above 640px.
- **Focus states:** visible 2px `accent` outline on every interactive element, no exceptions, including custom slot/status-light buttons.
- **Motion:** restrained — page transitions are simple fades (150ms), the only sustained animation is the soft pulse on an "in progress" status light. Respect `prefers-reduced-motion` (pulse becomes static).
- **Color contrast:** all text/background pairs above meet WCAG AA at minimum; status lights always pair color with a text label, never color alone.

---

## 9. What This Document Does Not Cover

Backend logic, RBAC enforcement, and the availability/scheduling engine referenced in §6.3 are out of scope here — this is the visual and UX layer. The accompanying Lovable prompt builds the **front-end design implementation only**, against mock data shaped like the real schema, so it can be used as a visual reference while the Next.js/Prisma rewrite proceeds in parallel.
