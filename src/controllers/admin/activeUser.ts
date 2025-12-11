import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../../../config/database';
import { User } from '../../entities/User';
import { Pet } from '../../entities/Pet';
import { DailyActiveUser } from '../../entities/activeUser';
import { Match } from '../../entities/Match';
import { MoreThanOrEqual, Between } from "typeorm";
import { log } from 'node:console';


const ActiveUserrepo = AppDataSource.getRepository(DailyActiveUser);

export class activeUserController {

  // Get user profile with pets

  static async saveActive(req: Request, res: Response) {
    try {
      // const userId = (req as any).user.id; // From auth middleware
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const userId = (req as any).user.id;
      let existing = await ActiveUserrepo.findOne({

        where: { user_id: userId, activity_date: today, }
      });

      // If already saved → return old record (NO INSERT)

      if (existing) {
        return res.json({
          success: true,
          data: existing,

        });

      }
      let saveActiveUser = ActiveUserrepo.create({ user_id: userId });

      await ActiveUserrepo.save(saveActiveUser);

      return res.json({
        success: true,
        data: saveActiveUser,
      });
      // res.status(200).json(saveActiveUser);

    } catch (error) {
      console.log("error------------->", error)
      res.status(500).json({ message: 'Server error', error });
    }
  }







}

