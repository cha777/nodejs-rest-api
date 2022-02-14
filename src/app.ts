import dotenv from "dotenv";

const dotenvResult = dotenv.config();

if (dotenvResult.error) {
  throw dotenvResult.error;
}

import express, { Application, Request, Response, json } from "express";
import { createServer } from "http";
import type { Server } from "http";

import { format, transports } from "winston";
import { logger } from "express-winston";
import type { LoggerOptions } from "express-winston";

import cors from "cors";
import debug from "debug";
import type { IDebugger } from "debug";

import { CommonRoutesConfig } from "./common/common.routes.config";
import { AuthRoutes } from "./auth/auth.routes.config";
import { UsersRoutes } from "./users/users.routes.config";

const app: Application = express();
const server: Server = createServer(app);
const port = 4000;
const routes: Array<CommonRoutesConfig> = [];
const debugLog: IDebugger = debug("app");

app.use(json());
app.use(cors());

const loggerOptions: LoggerOptions = {
  transports: [new transports.Console()],
  format: format.combine(
    format.json(),
    format.prettyPrint(),
    format.colorize({ all: true })
  ),
};

if (!process.env.DEBUG) {
  loggerOptions.meta = false;

  if (typeof global.it === "function") {
    loggerOptions.level = "http"; // for non-debug test runs, squelch entirely
  }
}

app.use(logger(loggerOptions));

routes.push(new AuthRoutes(app));
routes.push(new UsersRoutes(app));

const runningMessage = `Server running at http://localhost:${port}`;

app.get("/", (req: Request, res: Response) => {
  res.status(200).send(runningMessage);
});

export default server.listen(port, () => {
  routes.forEach((route: CommonRoutesConfig) => {
    debugLog(`Routes configured for ${route.getName()}`);
  });

  console.log(runningMessage);
});
