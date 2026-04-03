import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class UsersService {
    constructor(private readonly db: DbService) {}

    async verifyUser(userId: string) {
        try {
            console.log("Verifying User: ", userId);
            const user = await this.db.users.findUnique({
                where: { id: userId }
            });

            if(!user) {
                return {
                    success: false,
                    data: {
                        message: "User not Found"
                    }
                }
            }

            console.log(`Fetched [${user.id}]-[${user.email}] Details for Verification`);

            if(user.status === "SUSPENDED") {
                return {
                    success: false,
                    data: {
                        message: "User is Suspended"
                    }
                }
            }

            return {
                success: true,
                data: {
                    message: "User is Valid"
                }
            };
        } catch (error) {
            console.error("Error verifying user: ", error);
            return {
                success: false,
                data: {
                    message: "An error occurred while verifying user"
                }
            }
        }
    }

    async getUserByEmail(email: string) {
        try {

            console.log("Fetching User Details: ", email);
            const user = await this.db.users.findUnique({
                where: { email: email }
            });
    
            if(!user) {
                return {
                    success: false,
                    data: {
                        message: "User not Found"
                    }
                }
            }
    
            console.log(`Fetched [${user.id}]-[${user.email}] Details`);
    
            return {
                success: true,
                data: {
                    user: user
                }
            };
        } catch (error) {
            console.error("Error fetching user details: ", error);
            return {
                success: false,
                data: {
                    message: "An error occurred while fetching user details"
                }
            }
        }

    }

    async getUserById(userId: string) {
        try {

            console.log("Fetching User Details: ", userId);
            const user = await this.db.users.findUnique({
                where: { id: userId }
            });
    
            if(!user) {
                return {
                    success: false,
                    data: {
                        message: "User not Found"
                    }
                }
            }
    
            console.log(`Fetched [${user.id}]-[${user.email}] Details`);
    
            return {
                success: true,
                data: {
                    user: user
                }
            };
        } catch (error) {
            console.error("Error fetching user details: ", error);
            return {
                success: false,
                data: {
                    message: "An error occurred while fetching user details"
                }
            }
        }
    }

    async insertUser(name: string, email: string, passwordHash: string) {
        try {
            console.log("Inserting User: ", email);

            const newUser = await this.db.users.create({
                data: {
                    name: name,
                    email: email,
                    password: passwordHash,
                    status: "ACTIVE"
                }
            });

            console.log(`Inserted [${newUser.id}]-[${newUser.email}] Details`);

            return {
                success: true,
                data: {
                    user: newUser
                }
            };
        } catch (error) {
            console.error("Error inserting user: ", error);
            return {
                success: false,
                data: {
                    message: "An error occurred while inserting user"
                }
            }
        }
    }
}
