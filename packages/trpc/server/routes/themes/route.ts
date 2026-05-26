import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { themesService } from "@repo/services/themes";

const TAGS = ["Themes"];
const getPath = generatePath("/themes");

const themeConfigSchema = z.object({
  primaryColor: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
  fontFamily: z.string(),
  borderRadius: z.string(),
  buttonStyle: z.enum(["solid", "outline", "ghost"]),
  questionSpacing: z.enum(["compact", "normal", "spacious"]),
});

const themeOutput = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  config: z.any(),
  isDefault: z.boolean(),
  createdBy: z.string().nullable(),
  createdAt: z.date().nullable(),
});

export const themesRouter = router({
  /** GET /themes */
  list: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/"), tags: TAGS } })
    .input(z.undefined())
    .output(z.array(themeOutput))
    .query(async ({ ctx }) => {
      return themesService.listThemes(ctx.user?.id);
    }),

  /** POST /themes — create custom theme */
  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/"), tags: TAGS } })
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      config: themeConfigSchema,
    }))
    .output(themeOutput)
    .mutation(async ({ input, ctx }) => {
      return themesService.createTheme(ctx.user.id, input);
    }),
});
