import { UserRoleEnum } from "../enums/models-enums.js";
import { IUser } from "../types/models-interfaces.js";

import User from "../models/user-model.js";

export class UserRepository {
  async findById(userId: string): Promise<IUser | null> {
    return await User.findOne({ userId });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() });
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
  }

  async findAll(): Promise<IUser[]> {
    return await User.find().sort({ createdAt: -1 });
  }

  async findByRole(role: UserRoleEnum): Promise<IUser[]> {
    return await User.find({ role }).sort({ name: 1 });
  }

  async findActiveUsers(): Promise<IUser[]> {
    return await User.find({ isActive: true }).sort({ name: 1 });
  }

  async findInactiveUsers(): Promise<IUser[]> {
    return await User.find({ isActive: false }).sort({ name: 1 });
  }

  async create(data: {
    email: string;
    password: string;
    role: UserRoleEnum;
    name: string;
  }): Promise<IUser> {
    return await User.create({
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role,
      name: data.name,
    });
  }

  async updateById(
    userId: string,
    updates: Partial<IUser>
  ): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true }
    );
  }

  async updatePassword(
    userId: string,
    hashedPassword: string
  ): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { userId },
      { $set: { password: hashedPassword } },
      { new: true }
    );
  }

  async updateLastLogin(userId: string): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { userId },
      { $set: { lastLogin: new Date() } },
      { new: true }
    );
  }

  async deactivateUser(userId: string): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { userId },
      { $set: { isActive: false } },
      { new: true }
    );
  }

  async activateUser(userId: string): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { userId },
      { $set: { isActive: true } },
      { new: true }
    );
  }

  async deleteById(userId: string): Promise<IUser | null> {
    return await User.findOneAndDelete({ userId });
  }

  async getTotalCount(): Promise<number> {
    return await User.countDocuments();
  }

  async getCountByRole(): Promise<{ [key: string]: number }> {
    const stats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    return stats.reduce((acc: any, curr: any) => {
      acc[curr._id.toLowerCase()] = curr.count;
      return acc;
    }, {});
  }

  async searchByName(searchTerm: string): Promise<IUser[]> {
    return await User.find({
      name: { $regex: searchTerm, $options: "i" },
    }).sort({ name: 1 });
  }

  async searchByEmail(searchTerm: string): Promise<IUser[]> {
    return await User.find({
      email: { $regex: searchTerm, $options: "i" },
    }).sort({ email: 1 });
  }
}

export const userRepository = new UserRepository();
