import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../../../config/database';
import { User } from '../../entities/User';
import { Pet } from '../../entities/Pet';
import { Match } from '../../entities/Match';
import { MoreThanOrEqual, Between } from "typeorm";
import { log } from 'node:console';


const userRepository = AppDataSource.getRepository(User);
const petRepository = AppDataSource.getRepository(Pet);
const matchRepository = AppDataSource.getRepository(Match);

export class dashbordController {

  // Get user profile with pets




  static async getCount(req: Request, res: Response) {
    try {
      // const userId = (req as any).user.id; // From auth middleware






      async function getNewUser() {

        const userRepo = AppDataSource.getRepository(User);

        // TODAY
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0]; // '2025-12-03'

        // 7-day range including today
        const last7 = new Date(today);
        last7.setDate(today.getDate() - 6);
        const last7Str = last7.toISOString().split("T")[0];


        const todayUsers = await userRepo.count({
          where: { created_date: todayStr }
        });


        // LAST 7 DAYS USERS
        const rows = await userRepo
          .createQueryBuilder("u")
          .select("TO_CHAR(u.created_date, 'YYYY-MM-DD')", "date")
          .addSelect("COUNT(*)", "count")
          .where("u.created_date BETWEEN :start AND :end", {
            start: last7Str,
            end: todayStr,
          })
          .groupBy("u.created_date")
          .orderBy("u.created_date", "ASC")
          .getRawMany();

        console.log(rows);

        // FORMAT LAST 7 DAYS (fill 0 if no user)
        const lastWeekUser = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(last7);
          d.setDate(last7.getDate() + i);
          const dateStr = d.toISOString().slice(0, 10);

          console.log("dateStr------>", dateStr);

          rows.forEach(r => console.log(r.date, r.count));
          const row = rows.find(r => r.date === dateStr);

          lastWeekUser.push({
            date: dateStr,
            count: row ? Number(row.count) : 0
          });
        }

        return { todayUsers, lastWeekUser };
      }
      async function getActiveUser() {
        const dailyActiveUserRepo = AppDataSource.getRepository('DailyActiveUser');

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0]; // '2025-12-03'

        // 7-day range including today
        const last7 = new Date(today);
        last7.setDate(today.getDate() - 6);
        const last7Str = last7.toISOString().split("T")[0];

        // TODAY ACTIVE USERS
        const todayActive = await dailyActiveUserRepo.count({
          where: { activity_date: todayStr }, // exact match with date
        });

        // LAST 7 DAYS
        const rows = await dailyActiveUserRepo
          .createQueryBuilder("u")
          .select("TO_CHAR(u.activity_date, 'YYYY-MM-DD')", "date")
          .addSelect("COUNT(*)", "count")
          .where("u.activity_date BETWEEN :start AND :end", {
            start: last7Str,
            end: todayStr,
          })
          .groupBy("u.activity_date")
          .orderBy("u.activity_date", "ASC")
          .getRawMany();

        // Fill 7 days even if 0
        const weeklyActive = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(last7);
          d.setDate(last7.getDate() + i);
          const dateStr = d.toISOString().split("T")[0];

          const row = rows.find(r => r.date === dateStr);

          weeklyActive.push({
            date: dateStr,
            count: row ? Number(row.count) : 0
          });
        }

        return {
          todayActive,
          weeklyActive
        };
      }



      const totalPetsCount = await petRepository.count({
        where: { isBan: false }
      });
      const petBanCount = await petRepository.count({
        where: { isBan: true }
      });

      const userBanCount = await userRepository.count({
        where: { isBan: true }
      });

      const totaluserCount = await userRepository.count({
        where: { isBan: false }
      });



      let getnewUser = await getNewUser()
      let getActiveUsers = await getActiveUser()

      // console.log("new User ----------->", todaynewUser);




      return res.json({
        message: 'All count retrieved successfully',
        totalPets: totalPetsCount,
        totalBanPets: petBanCount,
        totalUser: totaluserCount,
        totalBanUsers: userBanCount,
        newUser: getnewUser,
        activeUser: getActiveUsers
        // totalPages: Math.ceil(totalUsers / limit)
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

}

