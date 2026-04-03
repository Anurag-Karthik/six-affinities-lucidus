import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

    
    async verifyUserWithPassword(email: string, password: string) {
        try {
            console.log("Verifying User with Password: ", email);
            const getUserRes = await this.usersService.getUserByEmail(email);
            console.log("Get User Result: ", getUserRes);

            if(!getUserRes.success) {
                return {
                    success: false,
                    data: getUserRes.data
                }
            }

            const user = getUserRes.data.user;

            if(user!.status === "SUSPENDED") {
                return {
                    success: false,
                    data: {
                        message: "User is Suspended"
                    }
                }
            }

            let isPasswordMatch = await bcrypt.compare(password, user?.password);

            if(!isPasswordMatch) {
                return {
                    success: false,
                    data: {
                        message: "Invalid password"
                    }
                }
            }

            return {
                success: true,
                data: {
                    user: {
                        id: user?.id,
                        name: user?.name,
                        email: user?.email,
                        status: user?.status,
                        createdAt: user?.createdAt,
                        updatedAt: user?.updatedAt
                    },
                    message: "User password verification successful"
                }
            };
        } catch (error) {
            console.error("Error verifying user with password: ", error);
            return {
                success: false,
                data: {
                    message: "An error occurred while verifying user with password"
                }
            }
        }
    }

    async login(user: any) {
        const payload = { username: user.id, sub: user.email };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
