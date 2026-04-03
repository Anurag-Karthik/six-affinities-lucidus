import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDTO } from './auth.dto';
import { AssessmentsService } from '../assessments/assessments.service';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService, private readonly assessmentsService: AssessmentsService, private readonly jwtService: JwtService) {}

    
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

        const findUserActiveAssessmentRes = await this.assessmentsService.findUserActiveAssessment(user.id);

        if(findUserActiveAssessmentRes.success) {
            console.log("User has an Active Assessment", findUserActiveAssessmentRes.data.assessment?.id);
        }

        return {
            message: "User Logged In Successfully",
            hasActiveAssessment: findUserActiveAssessmentRes.success,
            activeAssessment: findUserActiveAssessmentRes.data.assessment,
            accessToken: this.jwtService.sign(payload),
        };
    }

    async register(user: RegisterDTO) {
        try {
            console.log("Registering User: ", user.email);

            const existingUserRes = await this.usersService.getUserByEmail(user.email);
            console.log("Existing User Check Result: ", existingUserRes);
            if(existingUserRes.success) {
                return {
                    success: false,
                    data: {
                        message: "User with this email already exists"
                    }
                }
            }

            const passwordHash = await bcrypt.hash(user.password, 10);
            const insertUserRes = await this.usersService.insertUser(user.name, user.email, passwordHash);
            console.log("Insert User Result: ", insertUserRes);
            return {
                success: true,
                data: {
                    message: "User registered successfully",
                    accessToken: this.jwtService.sign({ username: insertUserRes.data.user!.id, sub: insertUserRes.data.user!.email })
                }
            };

        } catch (error) {
            console.error("Error registering user: ", error);
            return {
                success: false,
                data: {
                    message: "An error occurred while registering user"
                }
            }
        }
    }
}
