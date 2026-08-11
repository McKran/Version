import { Router, type IRouter } from "express";
import healthRouter from "./health";
import weatherRouter from "./weather";
import cropsRouter from "./crops";
import phCropsRouter from "./ph-crops";
import marketRouter from "./market";
import marketplaceRouter from "./marketplace";
import dashboardRouter from "./dashboard";
import farmingPlanRouter from "./farming-plan";
import geoRouter from "./geo";
import psgcRouter from "./psgc";
import chatRouter from "./chat";
import tutorialsRouter from "./tutorials";

const router: IRouter = Router();

router.use(healthRouter);
router.use(weatherRouter);
router.use(cropsRouter);
router.use(phCropsRouter);
router.use(marketRouter);
router.use(marketplaceRouter);
router.use(dashboardRouter);
router.use(farmingPlanRouter);
router.use(geoRouter);
router.use(psgcRouter);
router.use(chatRouter);
router.use(tutorialsRouter);

export default router;
