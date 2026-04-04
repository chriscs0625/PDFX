import { z } from "zod"

export const certificateSchema = z.object({
  recipientName:   z.string().min(1),
  courseName:      z.string().min(1),
  issuerName:      z.string().min(1),
  issuerTitle:     z.string().optional(),
  issueDate:       z.string(),
  certificateId:   z.string().min(1),
  description:     z.string().optional(),
})

export type CertificateData = z.infer<typeof certificateSchema>
