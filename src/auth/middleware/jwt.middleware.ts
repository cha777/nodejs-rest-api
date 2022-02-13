import { NextFunction, Request, Response } from "express";
import { createSecretKey, createHmac } from "crypto";
import { verify } from "jsonwebtoken";
import usersService from "../../users/services/users.service";

// @ts-expect-error
const jwtSecret: string = process.env.JWT_SECRET;

type Jwt = {
  refreshKey: string;
  userId: string;
  permissionFlags: string;
};

class JwtMiddleware {
  verifyRefreshBodyField(req: Request, res: Response, next: NextFunction) {
    if (req.body && req.body.refreshToken) {
      return next();
    } else {
      return res
        .status(400)
        .send({ errors: ["Missing required field: refreshToken"] });
    }
  }

  async validRefreshNeeded(req: Request, res: Response, next: NextFunction) {
    const user: any = await usersService.getUserByEmailWithPassword(
      res.locals.jwt.email
    );
    const salt = createSecretKey(Buffer.from(res.locals.jwt.refreshKey.data));
    const hash = createHmac("sha512", salt)
      .update(res.locals.jwt.userId + jwtSecret)
      .digest("base64");

    if (hash === req.body.refreshToken) {
      req.body = {
        userId: user._id,
        email: user.email,
        permissionFlags: user.permissionFlags,
      };
      return next();
    } else {
      return res.status(400).send({ errors: ["Invalid refresh token"] });
    }
  }

  async validJWTNeeded(req: Request, res: Response, next: NextFunction) {
    if (req.headers["authorization"]) {
      try {
        const authorization = req.headers["authorization"].split(" ");

        if (authorization[0] !== "Bearer") {
          return res.status(401).send();
        } else {
          res.locals.jwt = verify(authorization[1], jwtSecret) as Jwt;
          next();
        }
      } catch (err) {
        return res.status(403).send();
      }
    } else {
      return res.status(401).send();
    }
  }
}

export default new JwtMiddleware();
