import { Request, Response } from "express";

import debug from "debug";
import type { IDebugger } from "debug";

import { sign } from "jsonwebtoken";
import { createSecretKey, randomBytes, createHmac } from "crypto";

const log: IDebugger = debug("app:auth-controller");

const jwtSecret: string | undefined = process.env.JWT_SECRET;
const tokenExpirationInSeconds = 36000;

class AuthController {
  async createJWT(req: Request, res: Response) {
    try {
      if (jwtSecret) {
        const refreshId = req.body.userId + jwtSecret;
        const salt = createSecretKey(randomBytes(16));
        const hash = createHmac("sha512", salt)
          .update(refreshId)
          .digest("base64");

        req.body.refreshKey = salt.export();

        const token = sign(req.body, jwtSecret, {
          expiresIn: tokenExpirationInSeconds,
        });

        return res.status(201).send({ accessToken: token, refreshToken: hash });
      } else {
        throw "No JWT Secret defined";
      }
    } catch (err) {
      log("createJWT error: %O", err);
      return res.status(500).send();
    }
  }
}

export default new AuthController();
