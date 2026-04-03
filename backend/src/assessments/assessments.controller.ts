import { Body, Controller, Get } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDTO } from './assessments.dto';

@Controller('assessments')
export class AssessmentsController {
    constructor(private readonly assessmentsService: AssessmentsService) {}

    @Get('create-assessment')
    async createAssessment(@Body() body: CreateAssessmentDTO) {
        return this.assessmentsService.createAssessment(body.userId);
    }
}