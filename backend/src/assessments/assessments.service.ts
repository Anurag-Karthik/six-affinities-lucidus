import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UsersService } from '../users/users.service';
import { ResponseType } from '@prisma/client';

@Injectable()
export class AssessmentsService {
    constructor(private readonly db: DbService, private readonly usersService: UsersService) {}

    private async isUserAssessmentActive(userId: string, assessmentId: string, status: 'IN_PROGRESS' | 'COMPLETED' = 'IN_PROGRESS') {
        try {
            console.log('Finding assessment for user: ', userId, ' assessmentId: ', assessmentId, ' status: ', status);
    
            const assessment = await this.db.assessments.findFirst({
                where: {
                    id: assessmentId,
                    userId,
                    status,
                },
                select: {
                    id: true,
                    status: true,
                },
            });
    
            console.log(`${assessment ? 'Found' : 'Did not find'} assessment for user: `, userId, ' assessmentId: ', assessmentId, ' status: ', status);

            return {
                success: !!assessment,
                data: {
                    assessment: assessment
                }
            };

        } catch (error) {
            console.error("Error finding assessment: ", error);
            return {
                success: false,
                data: {
                    message: "An error occurred while finding the assessment"
                }
            }
        }
    }

    async createAssessment(userId: string): Promise<{success: boolean, data?: any}> {
        try {
            console.log("Creating assessment for userId: ", userId);
    
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
    
            return {
                success: true,
                data: {
                    assessmentId: insertedAssessmentId,
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

    async fetchAssessmentQuestions(userId: string, assessmentId: string): Promise<{success: boolean, data?: any}> {
        try {
            console.log("Fetching questions for assessmentId: ", assessmentId, " userId: ", userId);

            const assessmentRes = await this.isUserAssessmentActive(userId, assessmentId);

            if (!assessmentRes.success) {
                return {
                    success: false,
                    data: {
                        message: "Active Assessment not found for User"
                    }
                };
            }

            const getQuestionsRes = await this.db.affinityQuestions.findMany({
                where: {
                    isActive: true,
                },
            });

            console.log(`Fetched [${getQuestionsRes.length}] Questions for assessmentId: ${assessmentId}`);

            return {
                success: true,
                data: {
                    assessmentId,
                    questions: getQuestionsRes,
                    message: "Assessment questions fetched successfully"
                }
            };
        } catch (error) {
            console.error("Error fetching assessment questions: ", error);
            return {
                success: false,
                data: {
                    message: "An error occurred while fetching assessment questions"
                }
            };
        }
    }

    async getUserExistingAssessments(userId: string) {
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

    async getAssessment(assessmentId: string) {
        try {
            console.log("Fetching Assessment for assessmentId: ", assessmentId);
            const assessment = await this.db.assessments.findUnique({
                where: {
                    id: assessmentId
                },
                include: {
                    responses: true
                }
            });

            if(!assessment) {
                console.log(`No assessment found for assessmentId: ${assessmentId}`);
                return {
                    success: false,
                    data: {
                        message: "Assessment with Specified ID not found"
                    }
                }
            }
            
            console.log(`Fetched Assessment Details with [${assessment.responses.length}] Responses`);

            return {
                success: true,
                data: {
                    assessment: assessment
                }
            };
        } catch (error) {
            console.error("Error fetching assessment: ", error);
            return {
                success: false,
                data: {
                    message: "An error occurred while fetching the assessment"
                }
            };
        }
    }

    async recordResponse(userId: string, body: { assignmentId: string, questionId: string, response: 'YES' | 'NO' | 'MAYBE' }): Promise<{success: boolean, data?: any}> {
        try {
            console.log("Recording Response for User: ", userId, " with Payload: ", body);

            const isUserAssessmentActiveRes = await this.isUserAssessmentActive(userId, body.assignmentId);

            if(!isUserAssessmentActiveRes.success) {
                console.log('An Active Assessment with specified ID was not found for user: ', userId);
                return {
                    success: false,
                    data: {
                        message: 'Active Assessment not found for User',
                    },
                };
            }

            const activeAssessment = isUserAssessmentActiveRes.data!.assessment!;

            console.log('Verified active assessment before recording response: ', activeAssessment.id);

            const existingResponse = await this.db.assessmentResponses.findFirst({
                where: {
                    assessmentId: body.assignmentId,
                    questionId: body.questionId,
                },
                select: {
                    id: true,
                },
            });

            console.log(`${existingResponse ? 'Found' : 'No'} Existing Response for `, body.assignmentId, body.questionId);

            const insertResponseRes = existingResponse
                ? await this.db.assessmentResponses.update({
                    where: {
                        id: existingResponse.id,
                    },
                    data: {
                        response: body.response,
                    },
                })
                : await this.db.assessmentResponses.create({
                    data: {
                        assessmentId: body.assignmentId,
                        questionId: body.questionId,
                        response: body.response,
                    },
                });

            console.log("Recorded Response: ", insertResponseRes.id);
            console.log('Returning successful recordResponse for assessmentId: ', body.assignmentId, ' questionId: ', body.questionId);

            return {
                success: true,
                data: {
                    message: "Response Recorded successfully"
                }
            }
        } catch (error) {
            console.error("Error recording response: ", error);
            return {
                success: false,
                data: {
                    message: "An error occurred while recording the response"
                }
            }
        }
    }

    async completeAssessment(userId: string, body: { assignmentId: string, questionId: string, response: 'YES' | 'NO' | 'MAYBE' }): Promise<{success: boolean, data?: any}> {
        try {
            console.log('Completing Assessment for User: ', userId, ' with Payload: ', body);

            const isUserAssessmentActiveRes = await this.isUserAssessmentActive(userId, body.assignmentId);

            if(!isUserAssessmentActiveRes.success) {
                console.log('An Active Assessment with specified ID was not found for user: ', userId);
                return {
                    success: false,
                    data: {
                        message: 'Active Assessment not found for User',
                    },
                };
            }

            const assessment = isUserAssessmentActiveRes.data!.assessment!;

            console.log('Verified active assessment before completion: ', assessment.id);

            const existingResponse = await this.db.assessmentResponses.findFirst({
                where: {
                    assessmentId: body.assignmentId,
                    questionId: body.questionId,
                },
                select: {
                    id: true,
                },
            });

            if (existingResponse) {
                await this.db.assessmentResponses.update({
                    where: {
                        id: existingResponse.id,
                    },
                    data: {
                        response: body.response,
                    },
                });
            } else {
                await this.db.assessmentResponses.create({
                    data: {
                        assessmentId: body.assignmentId,
                        questionId: body.questionId,
                        response: body.response,
                    },
                });
            }

            console.log('Recorded final response for assessmentId: ', body.assignmentId, ' questionId: ', body.questionId);

            const responses = await this.db.assessmentResponses.findMany({
                where: {
                    assessmentId: body.assignmentId,
                },
                include: {
                    question: {
                        select: {
                            code: true,
                        },
                    },
                },
            });

            console.log('Fetched responses for completion. Count: ', responses.length);

            const responseScoreMap: Record<ResponseType, number> = {
                YES: 1,
                MAYBE: 0.5,
                NO: 0,
            };

            const codeScores: Record<string, number> = {};
            const noOfQuestionsPerCode: Record<string, number> = {};
            for (const item of responses) {
                const code = item.question.code;
                const score = responseScoreMap[item.response];

                codeScores[code] = (codeScores[code] || 0) + score;
                noOfQuestionsPerCode[code] = (noOfQuestionsPerCode[code] || 0) + 1;
            }

            const result: Record<string, number> = {};

            for (const code of Object.keys(codeScores)) {
                const normalizedScore = codeScores[code] / noOfQuestionsPerCode[code];
                result[code] = Math.round(normalizedScore * 100);
            }

            console.log('Calculated assessment result JSON: ', result);

            await this.db.assessmentResults.upsert({
                where: {
                    assessmentId: body.assignmentId,
                },
                create: {
                    assessmentId: body.assignmentId,
                    result,
                },
                update: {
                    result,
                },
            });

            console.log('Upserted assessment result for assessmentId: ', body.assignmentId);

            await this.db.assessments.update({
                where: {
                    id: body.assignmentId,
                },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                },
            });

            console.log('Updated assessment status to COMPLETED for assessmentId: ', body.assignmentId);
            console.log('Returning successful completeAssessment for assessmentId: ', body.assignmentId);

            return {
                success: true,
                data: {
                    result,
                    message: 'Assessment completed successfully',
                },
            };
        } catch (error) {
            console.error('Error completing assessment: ', error);
            return {
                success: false,
                data: {
                    message: 'An error occurred while completing the assessment',
                },
            };
        }
    }

    async fetchAssessmentResult(userId: string, assessmentId: string): Promise<{success: boolean, data?: any}> {
        try {
            console.log('Fetching assessment result for user: ', userId, ' assessmentId: ', assessmentId);

            const isUserAssessmentActiveRes = await this.isUserAssessmentActive(userId, assessmentId, 'COMPLETED');

            if(!isUserAssessmentActiveRes.success) {
                console.log('A Completed Assessment with specified ID was not found for user: ', userId);
                return {
                    success: false,
                    data: {
                        message: 'Completed assessment not found for user',
                    },
                };
            }

            const completedAssessment = isUserAssessmentActiveRes.data!.assessment!;

            console.log('Verified completed assessment before fetching result: ', completedAssessment.id);

            const resultRecord = await this.db.assessmentResults.findUnique({
                where: {
                    assessmentId,
                },
            });

            if (!resultRecord) {
                console.log('No result record found for assessmentId: ', assessmentId);
                return {
                    success: false,
                    data: {
                        message: 'Assessment result not found',
                    },
                };
            }

            console.log('Fetched assessment result record for assessmentId: ', assessmentId);
            console.log('Returning successful fetchAssessmentResult for assessmentId: ', assessmentId);

            return {
                success: true,
                data: {
                    result: resultRecord.result,
                    assessmentId: resultRecord.assessmentId,
                },
            };
        } catch (error) {
            console.error('Error fetching assessment result: ', error);
            return {
                success: false,
                data: {
                    message: 'An error occurred while fetching the assessment result',
                },
            };
        }
    }

    async findUserActiveAssessment(userId: string) {
        try {
            console.log('Finding active assessment for user: ', userId);

            const assessment = await this.db.assessments.findFirst({
                where: {
                    userId,
                    status: 'IN_PROGRESS',
                },
                select: {
                    id: true,
                    updatedAt: true,
                },
            });

            console.log(`${assessment ? 'Found' : 'Did not find'} active assessment for user: `, userId);

            return {
                success: !!assessment,
                data: {
                    assessment,
                },
            };
        } catch (error) {
            console.error('Error finding active assessment: ', error);
            return {
                success: false,
                data: {
                    message: 'An error occurred while finding active assessment for user',
                },
            };
        }
    }
}
