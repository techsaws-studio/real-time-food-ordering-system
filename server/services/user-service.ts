import bcrypt from "bcrypt";

import { IUser } from "../types/models-interfaces.js";
import { UserRoleEnum } from "../enums/models-enums.js";

import { userRepository } from "../repositories/user-repository.js";

import { ErrorHandler } from "../utils/error-handler.js";

export class UserService {
  private readonly SALT_ROUNDS = 10;

  async createUser(data: {
    email: string;
    password: string;
    role: UserRoleEnum;
    name: string;
  }): Promise<IUser> {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ErrorHandler("Email already registered", 400);
    }

    this.validatePassword(data.password);
    const hashedPassword = await this.hashPassword(data.password);

    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      role: data.role,
      name: data.name,
    });

    return user;
  }

  async authenticateUser(
    email: string,
    password: string
  ): Promise<{ user: IUser; isPasswordValid: boolean }> {
    const user = await userRepository.findByEmailWithPassword(email);

    if (!user) {
      throw new ErrorHandler("Invalid email or password", 401);
    }

    if (!user.isActive) {
      throw new ErrorHandler("Account is deactivated. Contact admin.", 403);
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new ErrorHandler("Invalid email or password", 401);
    }

    await userRepository.updateLastLogin(user.userId);
    const userWithoutPassword = await userRepository.findById(user.userId);
    if (!userWithoutPassword) {
      throw new ErrorHandler("User not found after authentication", 500);
    }

    return { user: userWithoutPassword, isPasswordValid };
  }

  async getUserById(userId: string): Promise<IUser> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new ErrorHandler(`User with ID ${userId} not found`, 404);
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<IUser> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new ErrorHandler(`User with email ${email} not found`, 404);
    }

    return user;
  }

  async getAllUsers(): Promise<IUser[]> {
    return await userRepository.findAll();
  }

  async getUsersByRole(role: UserRoleEnum): Promise<IUser[]> {
    return await userRepository.findByRole(role);
  }

  async getActiveUsers(): Promise<IUser[]> {
    return await userRepository.findActiveUsers();
  }

  async updateUser(userId: string, updates: Partial<IUser>): Promise<IUser> {
    await this.getUserById(userId);

    const allowedUpdates: Partial<IUser> = {
      name: updates.name,
      role: updates.role,
      isActive: updates.isActive,
    };

    const updatedUser = await userRepository.updateById(userId, allowedUpdates);

    if (!updatedUser) {
      throw new ErrorHandler("Failed to update user", 500);
    }

    return updatedUser;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    const userWithPassword = await userRepository.findByEmailWithPassword(
      user.email
    );
    if (!userWithPassword) {
      throw new ErrorHandler("User not found", 404);
    }

    const isCurrentPasswordValid = await this.comparePassword(
      currentPassword,
      userWithPassword.password
    );

    if (!isCurrentPasswordValid) {
      throw new ErrorHandler("Current password is incorrect", 401);
    }

    this.validatePassword(newPassword);

    const hashedPassword = await this.hashPassword(newPassword);
    await userRepository.updatePassword(userId, hashedPassword);
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    await this.getUserById(userId);

    this.validatePassword(newPassword);
    const hashedPassword = await this.hashPassword(newPassword);
    await userRepository.updatePassword(userId, hashedPassword);
  }

  async deactivateUser(userId: string): Promise<IUser> {
    await this.getUserById(userId);

    const user = await userRepository.deactivateUser(userId);
    if (!user) {
      throw new ErrorHandler("Failed to deactivate user", 500);
    }

    return user;
  }

  async activateUser(userId: string): Promise<IUser> {
    await this.getUserById(userId); // Verify user exists

    const user = await userRepository.activateUser(userId);

    if (!user) {
      throw new ErrorHandler("Failed to activate user", 500);
    }

    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.getUserById(userId); // Verify user exists

    const deletedUser = await userRepository.deleteById(userId);

    if (!deletedUser) {
      throw new ErrorHandler("Failed to delete user", 500);
    }
  }

  async getUserStats(): Promise<{
    total: number;
    admin: number;
    kitchen: number;
    receptionist: number;
    active: number;
    inactive: number;
  }> {
    const [countByRole, total, activeUsers, inactiveUsers] = await Promise.all([
      userRepository.getCountByRole(),
      userRepository.getTotalCount(),
      userRepository.findActiveUsers(),
      userRepository.findInactiveUsers(),
    ]);

    return {
      total,
      admin: countByRole.admin || 0,
      kitchen: countByRole.kitchen || 0,
      receptionist: countByRole.receptionist || 0,
      active: activeUsers.length,
      inactive: inactiveUsers.length,
    };
  }

  async searchUsers(searchTerm: string): Promise<IUser[]> {
    const [nameResults, emailResults] = await Promise.all([
      userRepository.searchByName(searchTerm),
      userRepository.searchByEmail(searchTerm),
    ]);

    // Combine and deduplicate results
    const combinedResults = [...nameResults, ...emailResults];
    const uniqueUsers = Array.from(
      new Map(combinedResults.map((user) => [user.userId, user])).values()
    );

    return uniqueUsers;
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  private async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new ErrorHandler("Password must be at least 8 characters", 400);
    }

    if (!/[A-Z]/.test(password)) {
      throw new ErrorHandler(
        "Password must contain at least one uppercase letter",
        400
      );
    }

    if (!/[a-z]/.test(password)) {
      throw new ErrorHandler(
        "Password must contain at least one lowercase letter",
        400
      );
    }

    if (!/[0-9]/.test(password)) {
      throw new ErrorHandler("Password must contain at least one number", 400);
    }
  }
}

export const userService = new UserService();
