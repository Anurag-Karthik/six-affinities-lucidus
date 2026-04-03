import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AssessmentsService {
    constructor(private readonly db: DbService, private readonly usersService: UsersService) {}

    async createAssessment(userId: string): Promise<{success: boolean, data?: any}> {
        try {
            console.log("Creating assessment for userId: ", userId);

            const verifyUserRes = await this.usersService.verifyUser(userId);
            console.log("Verified User", verifyUserRes);

            if (!verifyUserRes.success) {
                return { success: false, data: verifyUserRes.data };
            }
    
            const insertAssessmentRes = await this.db.assessments.create({
                data: {
                    userId: userId,
                    status: "IN_PROGRESS"
                },
                select: {
                    id: true,
                }
            });
    
            const insertedAssessmentId = insertAssessmentRes.id;
            console.log("Inserted Assessment: ", insertedAssessmentId);
    
            const getQuestionsRes = await this.db.affinityQuestions.findMany({
                where: {
                    isActive: true
                }
            });
            console.log(`Fetched [${getQuestionsRes.length}] Questions`);
    
            return {
                success: true,
                data: {
                    assessmentId: insertedAssessmentId,
                    questions: getQuestionsRes,
                    message: "Assessment Created Successfully"
                }
            }
        } catch (error) {
            console.error("Error creating assessment: ", error);
            return {
                success: false,
                data: {
                    message: "An error occurred while creating the assessment"
                }
            }
        }
    }

    async getExistingAssessment(userId: string) {
        try {
            console.log("Checking Existing Assessments for User: ", userId);

            const existingAssessments = await this.db.assessments.findMany({
                where:{
                    userId: userId,
                    status: "IN_PROGRESS"
                },
                select: {
                    id: true,
                    updatedAt: true
                }
            });
            console.log(`Fetched [${existingAssessments.length}] Existing Assessments for User: ${userId}`);
    
            return {
                success: true,
                data: {
                    assessments: existingAssessments,
                    message: existingAssessments.length > 0 ? "Existing assessments found" : "No existing assessments found"
                }
            }
        } catch (error) {
            console.error("Error Fetching Existing Assessments: ", error);
            return {
                success: false,
                data: {
                    message: "An error occurred while fetching existing assessments"
                }
            }
        }
    }
}
