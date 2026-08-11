import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use((err: any, req: any, res: any, next: any) => {
  next(err);
});

const candidateDistPaths = [
  path.resolve(process.cwd(), "artifacts/agri-assistant/dist/public"),
  path.resolve(process.cwd(), "../agri-assistant/dist/public"),
  path.resolve(__dirname, "../../agri-assistant/dist/public"),
  path.resolve(__dirname, "../../../agri-assistant/dist/public"),
];

const distPath = candidateDistPaths.find((p) => fs.existsSync(p)) || candidateDistPaths[0];
logger.info({ distPath, cwd: process.cwd(), exists: fs.existsSync(distPath) }, "Serving static frontend");

app.use(express.static(distPath));
app.get(/.*/, (req, res) => {
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Application frontend not found. Please build artifacts/agri-assistant.");
  }
});

export default app;
