import { z } from "zod"

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

export type ReportData = z.infer<typeof reportSchema>
