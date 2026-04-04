import { z } from "zod"

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

export type GradeReportData = z.infer<typeof gradeReportSchema>
