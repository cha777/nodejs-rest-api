import { NextFunction, Request, Response } from "express";

import debug from "debug";
import type { IDebugger } from "debug";

import { PermissionFlag } from "./common.permissionflag.enum";

const log: IDebugger = debug("app:common-permission-middleware");

class CommonPermissionMiddleware {
  permissionFlagRequired(requiredPermissionFlag: PermissionFlag) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const userPermissionFlags = parseInt(res.locals.jwt.permissionFlags);

        if (userPermissionFlags & requiredPermissionFlag) {
          next();
        } else {
          res.status(403).send();
        }
      } catch (err) {
        log(err);
      }
    };
  }

  async onlySameUserOrAdminCanDoThisAction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const userPermissionFlags = parseInt(res.locals.jwt.permissionFlags);

    if (
      req.params &&
      req.params.userId &&
      req.params.userId === res.locals.jwt.userId
    ) {
      return next();
    } else {
      if (userPermissionFlags & PermissionFlag.ADMIN_PERMISSION) {
        return next();
      } else {
        return res.status(403).send();
      }
    }
  }

  async userCantChangePermission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (
      "permissionFlags" in req.body &&
      req.body.permissionFlags !== res.locals.user.permissionFlags
    ) {
      res.status(400).send({
        errors: ["User cannot change permission flags"],
      });
    } else {
      next();
    }
  }
}

export default new CommonPermissionMiddleware();
