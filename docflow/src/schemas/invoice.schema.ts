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
