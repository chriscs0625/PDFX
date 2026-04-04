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
