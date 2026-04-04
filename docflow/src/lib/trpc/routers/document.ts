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
