import { Request, Response } from "express";
import { hash } from "argon2";
import debug from "debug";
import type { IDebugger } from "debug";

import usersService from "../services/users.service";

const log: IDebugger = debug("app:users-controller");

class UsersController {
  async listUsers(req: Request, res: Response) {
    const users = await usersService.list(100, 0);
    res.status(200).send(users);
  }

  async getUserById(req: Request, res: Response) {
    const user = await usersService.readById(req.body.id);
    res.status(200).send(user);
  }

  async createUser(req: Request, res: Response) {
    req.body.password = await hash(req.body.password);
    const userId = await usersService.create(req.body);
    res.status(201).send({ id: userId });
  }

  async patch(req: Request, res: Response) {
    if (req.body.password) {
      req.body.password = await hash(req.body.password);
    }
    log(await usersService.patchById(req.body.id, req.body));
    res.status(204).send();
  }

  async put(req: Request, res: Response) {
    req.body.password = await hash(req.body.password);
    log(await usersService.putById(req.body.id, req.body));
    res.status(204).send();
  }

  async removeUser(req: Request, res: Response) {
    log(await usersService.deleteById(req.body.id));
    res.status(204).send();
  }
}

export default new UsersController();
