import { Request, Response, NextFunction } from "express";
import userService from "../services/users.service";
import debug from "debug";
import type { IDebugger } from "debug";

const log: IDebugger = debug("app:users-controller");

class UsersMiddleware {
  async validateSameEmailDoesntExist(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = await userService.getUserByEmail(req.body.email);

    if (user) {
      res.status(400).send({ error: `User email already exists` });
    } else {
      next();
    }
  }

  async validateSameEmailBelongToSameUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = await userService.getUserByEmail(req.body.email);

    if (user && user._id === req.params.userId) {
      next();
    } else {
      res.status(400).send({ error: `Invalid email` });
    }
  }

  validatePatchEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (req.body.email) {
      log("Validating email", req.body.email);

      this.validateSameEmailBelongToSameUser(req, res, next);
    } else {
      next();
    }
  };

  async validateUserExists(req: Request, res: Response, next: NextFunction) {
    const user = await userService.readById(req.params.userId);

    if (user) {
      next();
    } else {
      res.status(404).send({
        error: `User ${req.params.userId} not found`,
      });
    }
  }

  async extractUserId(req: Request, res: Response, next: NextFunction) {
    req.body.id = req.params.userId;
    next();
  }
}

export default new UsersMiddleware();
