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
                    ...user
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
}
