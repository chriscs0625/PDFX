# DocFlow — PDF Document Generator
## VS Code Copilot PRD: A → Z Implementation Guide

> Stack: Next.js 15 App Router · TypeScript · Tailwind CSS · shadcn/ui · PDFx · @react-pdf/renderer · tRPC · Prisma · Supabase (PostgreSQL + Storage) · Better Auth · Zod

---

## What is DocFlow?

A full-stack web app where authenticated users select a document template
(Invoice, Business Report, Certificate, Grade Report), fill a smart form,
see a live PDF preview, generate the PDF with PDFx, and download or
re-download from their document history.

---

## A — Project Scaffold

```
You are an expert Next.js 15 developer.

Scaffold a new project called "docflow" using:
  - Next.js 15 App Router (TypeScript)
  - Tailwind CSS
  - shadcn/ui (run: npx shadcn@latest init)
  - Prisma ORM
  - tRPC (with @trpc/server, @trpc/client, @trpc/next, @trpc/react-query)
  - Better Auth
  - Zod
  - @react-pdf/renderer
  - PDFx CLI (npx pdfx-cli add table heading badge graph qrcode watermark)

Create this exact folder structure:
  src/
    app/
      (auth)/login/page.tsx
      (auth)/register/page.tsx
      (dashboard)/page.tsx
      (dashboard)/new/page.tsx
      (dashboard)/history/page.tsx
      api/trpc/[trpc]/route.ts
      api/auth/[...all]/route.ts
      api/pdf/generate/route.ts
      layout.tsx
    components/
      pdf/
        InvoicePDF.tsx
        ReportPDF.tsx
        CertificatePDF.tsx
        GradeReportPDF.tsx
        PDFPreview.tsx
      ui/  (shadcn components here)
      forms/
        InvoiceForm.tsx
        ReportForm.tsx
        CertificateForm.tsx
        GradeReportForm.tsx
      layout/
        Navbar.tsx
        Sidebar.tsx
    lib/
      trpc/
        client.ts
        server.ts
        router.ts
        routers/
          document.ts
          template.ts
      auth.ts
      prisma.ts
      supabase.ts
      pdf-theme.ts
    schemas/
      invoice.schema.ts
      report.schema.ts
      certificate.schema.ts
      grade-report.schema.ts
    types/
      index.ts

Install all dependencies.
Configure tsconfig.json paths:
  "@/*": ["./src/*"]
```

---

## B — Environment Variables

```
Create a .env.local file with this exact shape:

  DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
  NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
  NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
  SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
  BETTER_AUTH_SECRET="generate-32-char-random-string"
  BETTER_AUTH_URL="http://localhost:3000"

Also create .env.example with the same keys but empty values.
Add .env.local to .gitignore.
Create src/lib/env.ts that uses zod to validate all env vars at startup
and exports a typed `env` object. Throw a clear error if any required
var is missing.
```

---

## C — Prisma Schema + Database

```
Create prisma/schema.prisma with these models:

  generator client { provider = "prisma-client-js" }
  datasource db   { provider = "postgresql"; url = env("DATABASE_URL") }

  model User {
    id        String     @id @default(cuid())
    email     String     @unique
    name      String?
    createdAt DateTime   @default(now())
    documents Document[]
    sessions  Session[]
  }

  model Session {
    id        String   @id @default(cuid())
    userId    String
    token     String   @unique
    expiresAt DateTime
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  }

  model Document {
    id           String       @id @default(cuid())
    userId       String
    type         DocumentType
    title        String
    inputData    Json
    fileUrl      String?
    createdAt    DateTime     @default(now())
    user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  }

  enum DocumentType {
    INVOICE
    REPORT
    CERTIFICATE
    GRADE_REPORT
  }

Create src/lib/prisma.ts:
  import { PrismaClient } from "@prisma/client"
  const globalForPrisma = global as unknown as { prisma: PrismaClient }
  export const prisma = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

Run: npx prisma generate && npx prisma db push
```

---

## D — Better Auth Setup

```
Create src/lib/auth.ts:

  import { betterAuth } from "better-auth"
  import { prismaAdapter } from "better-auth/adapters/prisma"
  import { prisma } from "./prisma"

  export const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: { enabled: true },
    session: { expiresIn: 60 * 60 * 24 * 7 },
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL!,
  })

  export type Auth = typeof auth

Create src/app/api/auth/[...all]/route.ts:
  import { auth } from "@/lib/auth"
  import { toNextJsHandler } from "better-auth/next-js"
  export const { GET, POST } = toNextJsHandler(auth)

Create src/lib/auth-client.ts:
  import { createAuthClient } from "better-auth/react"
  export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  })
  export const { signIn, signUp, signOut, useSession } = authClient

Create middleware.ts at project root that protects all routes under
/(dashboard) — redirect unauthenticated users to /login.
```

---

## E — Zod Schemas for All Document Types

```
Create src/schemas/invoice.schema.ts:

  import { z } from "zod"

  export const lineItemSchema = z.object({
    description: z.string().min(1),
    quantity:    z.number().min(1),
    unitPrice:   z.number().min(0),
  })

  export const invoiceSchema = z.object({
    title:       z.string().default("Invoice"),
    invoiceNo:   z.string().min(1, "Invoice number required"),
    issueDate:   z.string(),
    dueDate:     z.string(),
    fromName:    z.string().min(1),
    fromEmail:   z.string().email(),
    fromAddress: z.string().min(1),
    toName:      z.string().min(1),
    toEmail:     z.string().email(),
    toAddress:   z.string().min(1),
    lineItems:   z.array(lineItemSchema).min(1),
    notes:       z.string().optional(),
    currency:    z.enum(["USD","EUR","GBP","LKR"]).default("USD"),
    status:      z.enum(["PAID","UNPAID","OVERDUE"]).default("UNPAID"),
  })

  export type InvoiceData = z.infer<typeof invoiceSchema>

Create src/schemas/report.schema.ts:

  export const reportSchema = z.object({
    title:       z.string().min(1),
    subtitle:    z.string().optional(),
    author:      z.string().min(1),
    date:        z.string(),
    sections:    z.array(z.object({
      heading:   z.string(),
      body:      z.string(),
    })).min(1),
    chartData:   z.array(z.object({
      label:     z.string(),
      value:     z.number(),
    })).optional(),
  })

Create src/schemas/certificate.schema.ts:

  export const certificateSchema = z.object({
    recipientName:   z.string().min(1),
    courseName:      z.string().min(1),
    issuerName:      z.string().min(1),
    issuerTitle:     z.string().optional(),
    issueDate:       z.string(),
    certificateId:   z.string().min(1),
    description:     z.string().optional(),
  })

Create src/schemas/grade-report.schema.ts:

  export const gradeSchema = z.object({
    subject:     z.string().min(1),
    grade:       z.string().min(1),
    score:       z.number().min(0).max(100),
    remarks:     z.string().optional(),
  })

  export const gradeReportSchema = z.object({
    studentName:   z.string().min(1),
    studentId:     z.string().min(1),
    institution:   z.string().min(1),
    term:          z.string().min(1),
    year:          z.string(),
    grades:        z.array(gradeSchema).min(1),
    gpa:           z.number().min(0).max(4).optional(),
    remarks:       z.string().optional(),
  })
```

---

## F — tRPC Server + Router

```
Create src/lib/trpc/server.ts:

  import { initTRPC, TRPCError } from "@trpc/server"
  import { auth } from "@/lib/auth"
  import { prisma } from "@/lib/prisma"
  import { ZodError } from "zod"

  export const createTRPCContext = async (opts: { headers: Headers }) => {
    const session = await auth.api.getSession({ headers: opts.headers })
    return { prisma, session, userId: session?.user?.id ?? null }
  }

  const t = initTRPC.context<typeof createTRPCContext>().create({
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      }
    },
  })

  export const createTRPCRouter  = t.router
  export const publicProcedure   = t.procedure
  export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" })
    return next({ ctx: { ...ctx, userId: ctx.userId } })
  })

Create src/lib/trpc/routers/document.ts:

  import { z } from "zod"
  import { createTRPCRouter, protectedProcedure } from "../server"
  import { invoiceSchema } from "@/schemas/invoice.schema"
  import { reportSchema } from "@/schemas/report.schema"
  import { certificateSchema } from "@/schemas/certificate.schema"
  import { gradeReportSchema } from "@/schemas/grade-report.schema"

  export const documentRouter = createTRPCRouter({

    list: protectedProcedure.query(async ({ ctx }) => {
      return ctx.prisma.document.findMany({
        where: { userId: ctx.userId },
        orderBy: { createdAt: "desc" },
      })
    }),

    create: protectedProcedure
      .input(z.object({
        type:      z.enum(["INVOICE","REPORT","CERTIFICATE","GRADE_REPORT"]),
        title:     z.string(),
        inputData: z.record(z.unknown()),
        fileUrl:   z.string().url().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.document.create({
          data: { ...input, userId: ctx.userId },
        })
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await ctx.prisma.document.delete({
          where: { id: input.id, userId: ctx.userId },
        })
      }),
  })

Create src/lib/trpc/router.ts:
  import { createTRPCRouter } from "./server"
  import { documentRouter } from "./routers/document"
  export const appRouter = createTRPCRouter({ document: documentRouter })
  export type AppRouter = typeof appRouter

Create src/app/api/trpc/[trpc]/route.ts:
  import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
  import { appRouter } from "@/lib/trpc/router"
  import { createTRPCContext } from "@/lib/trpc/server"
  const handler = (req: Request) =>
    fetchRequestHandler({ endpoint: "/api/trpc", req, router: appRouter, createContext: () => createTRPCContext({ headers: req.headers }) })
  export { handler as GET, handler as POST }

Create src/lib/trpc/client.ts:
  "use client"
  import { createTRPCReact } from "@trpc/react-query"
  import type { AppRouter } from "./router"
  export const trpc = createTRPCReact<AppRouter>()
```

---

## G — PDFx Theme System

```
Create src/lib/pdf-theme.ts:

  export const pdfTheme = {
    colors: {
      primary:     "#4F46E5",   // indigo
      secondary:   "#0EA5E9",   // sky
      success:     "#16A34A",
      danger:      "#DC2626",
      warning:     "#D97706",
      muted:       "#6B7280",
      border:      "#E5E7EB",
      background:  "#FFFFFF",
      surface:     "#F9FAFB",
      text:        "#111827",
      textMuted:   "#6B7280",
    },
    fonts: {
      body:     "Helvetica",
      heading:  "Helvetica-Bold",
    },
    spacing: {
      page:  { padding: 40 },
      card:  { padding: 16, borderRadius: 8 },
      table: { rowHeight: 32 },
    },
  }

  export type PDFTheme = typeof pdfTheme
```

---

## H — PDFx Invoice PDF Component

```
Create src/components/pdf/InvoicePDF.tsx.
Import from @react-pdf/renderer and from ./components/pdfx
(the PDFx components installed via CLI).

This component receives InvoiceData as props and renders:

  1. Page header: "INVOICE" bold heading left + invoice number right
  2. Two-column info block: From (sender) left, To (recipient) right
  3. Status Badge using PDFx Badge component:
       variant="success" when status=PAID
       variant="danger"  when status=OVERDUE
       variant="default" when status=UNPAID
  4. Line items Table using PDFx Table component with columns:
       Description | Qty | Unit Price | Total
     Last row is a bold "Total" row with sum of all line items
  5. Notes section (if present) in a muted italic style
  6. Footer: "Generated by DocFlow" centered in small muted text

Apply pdfTheme colors and spacing throughout.
All monetary values formatted using toFixed(2) with the currency symbol.
```

---

## I — PDFx Report PDF Component

```
Create src/components/pdf/ReportPDF.tsx.
Import from @react-pdf/renderer and PDFx components.

This component receives ReportData as props and renders:

  1. Cover-style header with title (large, primary color),
     subtitle, author name, and date — all centered with a
     bottom border line
  2. For each section in sections[]:
       - PDFx Heading at level 2
       - Body text in PDFx Text component
       - 12pt spacing between sections
  3. If chartData[] exists and has items, render a PDFx Graph
     (bar chart) with label/value pairs.
     Title: "Overview" above the chart.
  4. Page numbers in footer: "Page {pageNumber} of {totalPages}"

Apply pdfTheme colors. Heading text in primary color.
Body text in text color. Muted color for dates and author.
```

---

## J — PDFx Certificate PDF Component

```
Create src/components/pdf/CertificatePDF.tsx.
Import from @react-pdf/renderer and PDFx components.

This component receives CertificateData as props and renders:

  1. Page orientation: LANDSCAPE. Size: A4.
  2. Decorative outer border: a rectangle 20pt inset from page edges,
     2pt solid primary color border.
  3. "CERTIFICATE OF COMPLETION" heading centered at top,
     primary color, large font.
  4. "This certifies that" in italic muted text
  5. Recipient name in very large bold text, primary color, centered
  6. "has successfully completed" in muted text
  7. Course/achievement name in large secondary color text
  8. Description paragraph if present (optional)
  9. Issue date centered in small muted text
  10. Two-column footer:
        Left: Issuer name + issuer title (for signature line)
        Right: PDFx QRCode with certificateId encoded as URL:
               "https://docflow.app/verify/{certificateId}"
  11. PDFx Watermark: "CERTIFIED" in very light primary color
      behind all content

Apply pdfTheme throughout. Use landscape page layout.
```

---

## K — PDFx Grade Report PDF Component

```
Create src/components/pdf/GradeReportPDF.tsx.
Import from @react-pdf/renderer and PDFx components.

This component receives GradeReportData as props and renders:

  1. Header block:
       - Institution name in bold primary color heading
       - "Academic Grade Report" subtitle
       - Horizontal divider line
  2. Student info two-column row:
       Left: Student Name + Student ID
       Right: Term + Year
  3. Grades Table using PDFx Table with columns:
       Subject | Score | Grade | Remarks
     Color-code score column text:
       score >= 75: success color
       score >= 50: warning color
       score <  50: danger color
  4. Summary row below table:
       "GPA: {gpa}" if gpa exists, right-aligned
  5. Overall Remarks section if present:
       PDFx Heading level 3 + text body
  6. Footer: institution name + "Confidential" watermark if GPA < 2.0

Apply pdfTheme. Table header row in primary color with white text.
Alternating row background: white and surface color.
```

---

## L — Live PDF Preview Component

```
Create src/components/pdf/PDFPreview.tsx.
This is a CLIENT component ("use client").

It uses @react-pdf/renderer's PDFViewer for desktop
and a "Download to preview" fallback for mobile.

Props:
  type: "INVOICE" | "REPORT" | "CERTIFICATE" | "GRADE_REPORT"
  data: unknown (the validated form data)

Logic:
  1. Dynamically import the correct PDF component based on type:
       INVOICE       → InvoicePDF
       REPORT        → ReportPDF
       CERTIFICATE   → CertificatePDF
       GRADE_REPORT  → GradeReportPDF
  2. Detect if window exists (SSR guard). If not, return a skeleton.
  3. Wrap PDFViewer in a div with:
       width: 100%
       height: 600px
       border: 1px solid var(--border)
       border-radius: var(--radius)
  4. Show a "Refresh preview" button that forces a re-render.
  5. Show a loading spinner while the PDF renders.
  6. Catch render errors with an error boundary and show a friendly
     "Preview failed — check your form data" message.

Use React.Suspense with a Skeleton fallback from shadcn/ui.
```

---

## M — Forms (Invoice Form)

```
Create src/components/forms/InvoiceForm.tsx.
This is a CLIENT component using react-hook-form + zodResolver.

Use the invoiceSchema from src/schemas/invoice.schema.ts.

UI structure (use shadcn/ui components throughout):
  1. Section: "Invoice Details"
       - Input: Invoice Number
       - DatePicker: Issue Date
       - DatePicker: Due Date
       - Select: Currency (USD, EUR, GBP, LKR)
       - Select: Status (PAID, UNPAID, OVERDUE)
  2. Two-column grid Section: "From / To"
       Left column "From":
         - Input: Name
         - Input: Email
         - Textarea: Address
       Right column "To":
         - Input: Name
         - Input: Email
         - Textarea: Address
  3. Section: "Line Items"
       - useFieldArray for lineItems[]
       - Each row: Description input | Qty number | Unit Price number | Remove button
       - "Add Item" button appends a blank row
       - Live total calculation displayed below the table
  4. Section: "Notes" (optional Textarea)
  5. Action row:
       - "Preview" button: calls onPreview(data) if form valid
       - "Generate & Download" button: calls onGenerate(data)

Props:
  onPreview:  (data: InvoiceData) => void
  onGenerate: (data: InvoiceData) => Promise<void>
  isGenerating: boolean

Apply the same pattern for ReportForm, CertificateForm, GradeReportForm
each using their respective schema and field structure.
```

---

## N — PDF Generation API Route

```
Create src/app/api/pdf/generate/route.ts.
This is a Next.js Route Handler.

Method: POST
Auth: Validate the session using auth.api.getSession(). Return 401 if none.

Body shape:
  { type: "INVOICE" | "REPORT" | "CERTIFICATE" | "GRADE_REPORT", data: object }

Steps:
  1. Parse and validate the body. Return 400 with Zod error if invalid.
  2. Dynamically import the correct PDF component:
       INVOICE       → InvoicePDF
       REPORT        → ReportPDF
       CERTIFICATE   → CertificatePDF
       GRADE_REPORT  → GradeReportPDF
  3. Use renderToStream from @react-pdf/renderer:
       const stream = await renderToStream(<SelectedPDF data={data} />)
  4. Convert the stream to a Buffer.
  5. Upload the buffer to Supabase Storage:
       bucket: "documents"
       path:   "{userId}/{type}/{Date.now()}.pdf"
     Return the public URL.
  6. Save the document record via Prisma:
       Document.create({ userId, type, title, inputData, fileUrl })
  7. Return: { fileUrl, documentId }

Error handling: wrap entire handler in try/catch.
Return 500 with { error: "PDF generation failed" } on unhandled errors.

Note: Add this to next.config.ts to fix react-pdf SSR:
  experimental: { serverComponentsExternalPackages: ["@react-pdf/renderer"] }
```

---

## O — Dashboard Page

```
Create src/app/(dashboard)/page.tsx.
This is a SERVER component.

Fetch documents using the tRPC caller (server-side):
  const documents = await caller.document.list()

Render:
  1. Page header: "My Documents" h1 + "New Document" Button (links to /new)
  2. Stats row (3 cards using shadcn Card):
       - Total Documents (count of all)
       - This Month (count where createdAt in current month)
       - Most Used Type (mode of document types)
  3. Recent Documents section:
       If no documents: EmptyState component with illustration and
       "Create your first document" CTA button.
       If documents exist: DocumentCard grid (3 columns on desktop,
       1 on mobile) — each card shows:
         - Document type badge (color coded)
         - Title
         - Created date (formatted: "Apr 4, 2026")
         - Download button (opens fileUrl in new tab)
         - Delete button (calls document.delete mutation with confirmation)

Wrap mutations in try/catch with toast notifications (use sonner).
```

---

## P — New Document Page (Template Selector + Form + Preview)

```
Create src/app/(dashboard)/new/page.tsx as a CLIENT component.

This is the core creation flow — a multi-step UI:

Step 1 — Template Selector:
  Show 4 large cards in a 2x2 grid:
    INVOICE      — icon + "Invoice" + "For billing clients"
    REPORT       — icon + "Report" + "Business & data reports"
    CERTIFICATE  — icon + "Certificate" + "Awards & completion"
    GRADE REPORT — icon + "Grade Report" + "Academic records"
  Each card is selectable (highlighted border when selected).
  "Continue" button enabled only when a type is selected.

Step 2 — Form + Live Preview (side-by-side layout):
  Left half (scrollable): The form matching selected type.
  Right half (sticky):    PDFPreview component.

  The preview updates automatically:
    - useWatch() from react-hook-form watches all fields
    - Debounce updates by 500ms (use useDebouncedValue)
    - Pass current form values to PDFPreview

Step 3 — Generating state:
  When "Generate & Download" is clicked:
    1. Validate form (show field errors if invalid)
    2. Set isGenerating = true
    3. POST to /api/pdf/generate with { type, data }
    4. On success:
         - Call trpc.document.create to save record
         - Trigger file download via window.open(fileUrl)
         - Show success toast: "PDF generated and saved!"
         - Redirect to /history after 1.5s
    5. On error: show error toast, set isGenerating = false

Show a progress indicator during generation.
Use shadcn Stepper or manual step tracking with a top progress bar.
```

---

## Q — Document History Page

```
Create src/app/(dashboard)/history/page.tsx as a CLIENT component.
Use trpc.document.list.useQuery().

Features:
  1. Search input: filters documents by title (client-side)
  2. Filter tabs: All | Invoice | Report | Certificate | Grade Report
  3. Sort dropdown: Newest first | Oldest first | A-Z
  4. Documents in a table (shadcn Table component) with columns:
       Type badge | Title | Created | Actions
     Actions column: Download icon button + Delete icon button
  5. Pagination: show 10 per page, shadcn Pagination component
  6. Loading state: skeleton rows while query fetches
  7. Empty state per filter: "No {type} documents found"

Delete confirmation: use shadcn AlertDialog before calling mutation.
Show toast on successful delete.
```

---

## R — Layout: Navbar + Sidebar

```
Create src/components/layout/Navbar.tsx:
  - Logo "DocFlow" left
  - User avatar + name right (from useSession)
  - Sign out button (calls signOut from auth-client)

Create src/components/layout/Sidebar.tsx:
  Navigation links:
    - Dashboard  (icon: LayoutDashboard)  → /
    - New Document (icon: FilePlus)       → /new
    - History      (icon: Clock)          → /history
  Active link: highlighted with primary color background pill.
  Collapsible on mobile (hamburger toggle).

Create src/app/(dashboard)/layout.tsx:
  Protect with session check — redirect to /login if no session.
  Layout: fixed sidebar (240px) + main content area.
  Show Navbar at top of main content area.
  Apply bg-background min-h-screen.
```

---

## S — Auth Pages

```
Create src/app/(auth)/login/page.tsx:
  Card centered on screen with:
    - "DocFlow" logo/wordmark at top
    - Email + Password inputs (shadcn Input)
    - "Sign in" button: calls signIn.email({ email, password })
    - Link to /register
    - Error message display on failed auth
    - Redirect to / on success

Create src/app/(auth)/register/page.tsx:
  Same card layout with:
    - Name + Email + Password + Confirm Password inputs
    - "Create account" button: calls signUp.email({ name, email, password })
    - Link to /login
    - Redirect to / on success

Both pages: redirect to / if user is already authenticated.
Both pages: use react-hook-form + zod validation.
Show loading spinner in button while auth request is in flight.
```

---

## T — Global Layout + Providers

```
Create src/app/layout.tsx:

  import { Geist } from "next/font/google"
  import { TRPCReactProvider } from "@/lib/trpc/client"
  import { Toaster } from "sonner"
  import "./globals.css"

  Wrap children in:
    <TRPCReactProvider>
      <Toaster position="bottom-right" richColors />
      {children}
    </TRPCReactProvider>

Create src/lib/trpc/client.ts with TRPCReactProvider:
  Use QueryClient with:
    staleTime: 30 seconds
    retry: 1

Create src/app/globals.css:
  - Import Tailwind base/components/utilities
  - Import shadcn CSS variables for light + dark theme

Add ThemeProvider from next-themes if dark mode support is wanted.
Toggle in Navbar: sun/moon icon.
```

---

## U — Supabase Storage Setup

```
Create src/lib/supabase.ts:

  import { createClient } from "@supabase/supabase-js"

  export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  export async function uploadPDF(
    buffer: Buffer,
    path: string
  ): Promise<string> {
    const { error } = await supabase.storage
      .from("documents")
      .upload(path, buffer, {
        contentType: "application/pdf",
        upsert: false,
      })
    if (error) throw new Error(`Storage upload failed: ${error.message}`)
    const { data } = supabase.storage
      .from("documents")
      .getPublicUrl(path)
    return data.publicUrl
  }

In Supabase dashboard:
  1. Create bucket "documents" with public access.
  2. Set RLS policy: only authenticated users can upload to their own
     userId subfolder.
     Policy: (storage.foldername(name))[1] = auth.uid()
```

---

## V — Error Handling + Loading States

```
Create src/app/error.tsx (global error boundary):
  Show a friendly error card with:
    - "Something went wrong" heading
    - Error message (in dev only)
    - "Try again" button (calls reset())
    - "Go home" link

Create src/app/loading.tsx (global loading):
  Full-screen centered spinner using shadcn Skeleton.

Create src/components/ui/EmptyState.tsx:
  Props: title, description, actionLabel, onAction
  Renders: centered icon + text + CTA button.
  Used in Dashboard and History for zero-data states.

Create src/components/ui/DocumentCard.tsx:
  Props: document: Document
  Renders shadcn Card with:
    - Type badge (color coded per DocumentType enum)
    - Title
    - Formatted date
    - Download + Delete action buttons

Add error handling to all tRPC mutations:
  .onError: show sonner toast with error.message
  .onSuccess: show sonner toast with success message
```

---

## W — TypeScript Types

```
Create src/types/index.ts:

  import type { Document, DocumentType, User } from "@prisma/client"
  export type { Document, DocumentType, User }

  export type PDFGenerateRequest = {
    type: DocumentType
    data: Record<string, unknown>
  }

  export type PDFGenerateResponse = {
    fileUrl: string
    documentId: string
  }

  export type DocumentCardProps = {
    document: Document
    onDelete: (id: string) => void
    onDownload: (fileUrl: string) => void
  }

  export type TemplateType = "INVOICE" | "REPORT" | "CERTIFICATE" | "GRADE_REPORT"

  export const TEMPLATE_META: Record<TemplateType, {
    label: string
    description: string
    color: string
  }> = {
    INVOICE:      { label: "Invoice",      description: "For billing clients",    color: "blue" },
    REPORT:       { label: "Report",       description: "Business & data reports", color: "purple" },
    CERTIFICATE:  { label: "Certificate",  description: "Awards & completion",    color: "amber" },
    GRADE_REPORT: { label: "Grade Report", description: "Academic records",       color: "green" },
  }
```

---

## X — Testing

```
Install: jest, @testing-library/react, @testing-library/jest-dom,
         jest-environment-jsdom, ts-jest

Create jest.config.ts:
  module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
    setupFilesAfterFramework: ["<rootDir>/jest.setup.ts"],
  }

Create jest.setup.ts:
  import "@testing-library/jest-dom"

Write these test files:

  src/schemas/__tests__/invoice.schema.test.ts
    - Test: valid invoice data passes
    - Test: missing invoiceNo fails with correct message
    - Test: empty lineItems array fails
    - Test: invalid email format fails

  src/components/forms/__tests__/InvoiceForm.test.tsx
    - Render the form
    - Fill required fields
    - Assert "Add Item" button adds a row
    - Assert total updates when quantity changes

  src/lib/__tests__/pdf-theme.test.ts
    - Assert pdfTheme has all required color keys
    - Assert color values are valid hex strings

Run: npx jest --coverage
```

---

## Y — next.config.ts + Deployment Config

```
Create next.config.ts:

  import type { NextConfig } from "next"

  const nextConfig: NextConfig = {
    experimental: {
      serverComponentsExternalPackages: ["@react-pdf/renderer"],
    },
    images: {
      remotePatterns: [
        { protocol: "https", hostname: "*.supabase.co" },
      ],
    },
  }

  export default nextConfig

Create vercel.json (for Vercel deployment):
  {
    "functions": {
      "src/app/api/pdf/generate/route.ts": {
        "maxDuration": 30
      }
    }
  }

  The PDF generation route needs 30s because renderToStream can be slow
  for complex documents on cold start.

Deployment steps for Vercel:
  1. Push repo to GitHub
  2. Import project in Vercel
  3. Set all env vars from .env.local in Vercel dashboard
  4. Run: npx prisma generate (add to build command:
       "prisma generate && next build")
  5. Set DATABASE_URL to Supabase connection string (Session mode, port 5432)
  6. Deploy

Add .vercelignore:
  .env.local
  node_modules
  .next
```

---

## Z — Final Copilot Review Prompt

```
You are a senior Next.js code reviewer.

Review the entire DocFlow codebase and do the following:

1. Check all "use client" / "use server" boundaries are correct.
   - Server components must not import client-only hooks.
   - Client components must not use Node.js APIs directly.

2. Verify every page under /(dashboard) is protected:
   - Either by middleware.ts redirect
   - Or by session check inside the layout

3. Check all Prisma queries:
   - Every query filters by userId (no cross-user data leak).
   - All mutations use the correct userId from the session.

4. Check the PDF generation API route:
   - Auth is verified before any processing.
   - renderToStream is called server-side only.
   - Supabase upload path includes userId to scope files.

5. Check all Zod schemas:
   - Every form submission is validated server-side (not just client-side).
   - API route bodies are parsed with .safeParse() before use.

6. Fix any TypeScript errors:
   - Run: npx tsc --noEmit
   - Fix all type errors found.

7. Check all environment variable accesses:
   - No process.env usage without the env.ts validation wrapper.
   - No NEXT_PUBLIC_ vars used server-side only.

8. Output a short summary of issues found and fixes applied,
   grouped by severity: Critical / Warning / Info.
```

---

## Quick Reference: Key Commands

```bash
# Install PDFx components
npx pdfx-cli add table heading badge graph qrcode watermark card

# Prisma
npx prisma generate
npx prisma db push
npx prisma studio

# Dev
npm run dev

# Type check
npx tsc --noEmit

# Test
npx jest --coverage

# Build
npm run build
```

---

## File Count Summary

| Area            | Files |
|-----------------|-------|
| PDF components  | 5     |
| Forms           | 4     |
| Pages           | 6     |
| API routes      | 3     |
| tRPC routers    | 2     |
| Schemas         | 4     |
| Lib utilities   | 5     |
| Types           | 1     |
| Tests           | 3     |
| Config          | 4     |
| **Total**       | **37**|
