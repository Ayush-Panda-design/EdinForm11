import { router } from "../trpc";
import { healthRouter } from "../routes/health/route";
import { authRouter } from "../routes/auth/route";
import { formsRouter } from "../routes/forms/route";
import { responsesRouter } from "../routes/responses/route";
import { analyticsRouter } from "../routes/analytics/route";
import { publicRouter } from "../routes/public/route";
import { templatesRouter } from "../routes/templates/route";
import { themesRouter } from "../routes/themes/route";
import { adminRouter } from "../routes/admin/route";
import { countRouterProcedures, listRouterNames } from "./architecture";

const countingRouter = router({
  health: healthRouter,
  auth: authRouter,
  forms: formsRouter,
  responses: responsesRouter,
  analytics: analyticsRouter,
  public: publicRouter,
  templates: templatesRouter,
  themes: themesRouter,
  admin: adminRouter,
});

export function getTrpcArchitecture() {
  return {
    routers: listRouterNames(countingRouter),
    procedureCount: countRouterProcedures(countingRouter),
  };
}
