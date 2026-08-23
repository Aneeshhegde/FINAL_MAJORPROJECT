import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Admin, IAdmin } from '../models/Admin';
import { config } from '../config/env';

export interface AuthToken {
  token: string;
  expiresAt: Date;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER'
}

const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 3,
  [Role.ADMIN]: 2,
  [Role.VIEWER]: 1
};

export class AuthService {
  async authenticate(email: string, password: string): Promise<AuthToken> {
    const admin = await Admin.findOne({ email, isActive: true });
    
    if (!admin) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await this.verifyPassword(password, admin.passwordHash);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    admin.lastLoginAt = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id.toString(), 
        email: admin.email, 
        role: admin.role 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const decoded = jwt.decode(token) as any;
    const expiresAt = new Date(decoded.exp * 1000);

    return {
      token,
      expiresAt,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    };
  }

  async verifyToken(token: string): Promise<IAdmin> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      
      const admin = await Admin.findById(decoded.id);
      
      if (!admin || !admin.isActive) {
        throw new Error('Invalid or expired token');
      }

      return admin;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  hasPermission(admin: IAdmin, requiredRole: Role): boolean {
    const adminRoleLevel = ROLE_HIERARCHY[admin.role as Role] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;
    
    return adminRoleLevel >= requiredRoleLevel;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async createAdmin(email: string, password: string, name: string, role: Role = Role.VIEWER): Promise<IAdmin> {
    const existingAdmin = await Admin.findOne({ email });
    
    if (existingAdmin) {
      throw new Error('Admin with this email already exists');
    }

    const passwordHash = await this.hashPassword(password);
    
    const admin = new Admin({
      email,
      passwordHash,
      name,
      role,
      isActive: true
    });

    await admin.save();
    
    return admin;
  }
}
