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


        // LAST 1 MONTH (30 DAYS)
        const last30 = new Date(today);
        last30.setDate(today.getDate() - 29);
        const last30Str = last30.toISOString().split("T")[0];

        // LAST 3 MONTH (90 DAYS)
        const last90 = new Date(today);
        last90.setDate(today.getDate() - 89);
        const last90Str = last90.toISOString().split("T")[0];

        // LAST 6 MONTH (180 DAYS)
        const last180 = new Date(today);
        last180.setDate(today.getDate() - 179);
        const last180Str = last180.toISOString().split("T")[0];

        // LAST 1 YEAR (365 DAYS)
        const last365 = new Date(today);
        last365.setDate(today.getDate() - 364);
        const last365Str = last365.toISOString().split("T")[0];



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

        // FORMAT LAST 7 DAYS (fill 0 if no user)
        const lastWeekUser = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(last7);
          d.setDate(last7.getDate() + i);
          const dateStr = d.toISOString().slice(0, 10);


          rows.forEach(r => console.log(r.date, r.count));
          const row = rows.find(r => r.date === dateStr);

          lastWeekUser.push({
            date: dateStr,
            count: row ? Number(row.count) : 0
          });
        }

        // LAST 1 MONTH (30 DAYS COUNT)
        const lastMonthUsers = await userRepo.count({
          where: {
            created_date: Between(last30Str, todayStr)
          }
        });

        // LAST 3 MONTH (90 DAYS COUNT)
        const last3MonthUsers = await userRepo.count({
          where: {
            created_date: Between(last90Str, todayStr)
          }
        });

        // LAST 6 MONTH (180 DAYS COUNT)
        const last6MonthUsers = await userRepo.count({
          where: {
            created_date: Between(last180Str, todayStr)
          }
        });

        // LAST 1 YEAR (365 DAYS COUNT)
        const last1YearUsers = await userRepo.count({
          where: {
            created_date: Between(last365Str, todayStr)
          }
        });

        return { todayUsers, lastWeekUser, lastMonthUsers, last3MonthUsers, last6MonthUsers, last1YearUsers };
      }
      async function getActiveUser() {
        const dailyActiveUserRepo = AppDataSource.getRepository('DailyActiveUser');

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0]; // '2025-12-03'

        // 7-day range including today
        const last7 = new Date(today);
        last7.setDate(today.getDate() - 6);
        const last7Str = last7.toISOString().split("T")[0];

        // LAST 1 MONTH (30 days)
        const last30 = new Date(today);
        last30.setDate(today.getDate() - 29);
        const last30Str = last30.toISOString().split("T")[0];

        // LAST 3 MONTH (90 days)
        const last90 = new Date(today);
        last90.setDate(today.getDate() - 89);
        const last90Str = last90.toISOString().split("T")[0];

        // LAST 6 MONTH (180 days)
        const last180 = new Date(today);
        last180.setDate(today.getDate() - 179);
        const last180Str = last180.toISOString().split("T")[0];

        // LAST 1 YEAR (365 days)
        const last365 = new Date(today);
        last365.setDate(today.getDate() - 364);
        const last365Str = last365.toISOString().split("T")[0];

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

        // LAST 1 MONTH TOTAL
        const lastMonthActive = await dailyActiveUserRepo.count({
          where: {
            activity_date: Between(last30Str, todayStr)
          }
        });

        // LAST 3 MONTH TOTAL
        const last3MonthActive = await dailyActiveUserRepo.count({
          where: {
            activity_date: Between(last90Str, todayStr)
          }
        });

        // LAST 6 MONTH TOTAL
        const last6MonthActive = await dailyActiveUserRepo.count({
          where: {
            activity_date: Between(last180Str, todayStr)
          }
        });

        // LAST 1 YEAR TOTAL
        const last1YearActive = await dailyActiveUserRepo.count({
          where: {
            activity_date: Between(last365Str, todayStr)
          }
        });

        return {
          todayActive,
          weeklyActive,
          lastMonthActive,
          last3MonthActive,
          last6MonthActive,
          last1YearActive
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

