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
