import { Body, Controller, Post, Request, UnauthorizedException } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { RecordResponseDTO, FetchResultDTO, FetchAssessmentQuestionsDTO } from './assessments.dto';

@Controller('assessments')
export class AssessmentsController {
    constructor(private readonly assessmentsService: AssessmentsService) {}

    @Post('create-assessment')
    async createAssessment(@Request() req) {
        const userId = req.user?.id;

        return this.assessmentsService.createAssessment(userId);
    }

    @Post('fetch-assessment-questions')
    async fetchAssessmentQuestions(@Request() req, @Body() body: FetchAssessmentQuestionsDTO) {
        const userId = req.user?.id;

        if (!userId) {
            throw new UnauthorizedException('User not authenticated');
        }

        return this.assessmentsService.fetchAssessmentQuestions(userId, body.assessmentId);
    }

    @Post('record-response')
    async recordResponse(@Request() req, @Body() body: RecordResponseDTO) {
        const userId = req.user?.id;

        return this.assessmentsService.recordResponse(userId, body);
    }

    @Post('complete-assessment')
    async completeAssessment(@Request() req, @Body() body: RecordResponseDTO) {
        const userId = req.user?.id;

        return this.assessmentsService.completeAssessment(userId, body);
    }

    @Post('get-existing-assessments')
    async getExistingAssessments(@Request() req) {
        const userId = req.user?.id;

        if (!userId) {
            throw new UnauthorizedException('User not authenticated');
        }

       return this.assessmentsService.getUserExistingAssessments(userId);
    }

    @Post('fetch-result')
    async fetchResult(@Request() req, @Body() body: FetchResultDTO) {
        const userId = req.user?.id;

        if (!userId) {
            throw new UnauthorizedException('User not authenticated');
        }

        return this.assessmentsService.fetchAssessmentResult(userId, body.assessmentId);
    }
}