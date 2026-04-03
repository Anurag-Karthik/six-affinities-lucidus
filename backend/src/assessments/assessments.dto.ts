import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";

export class RecordResponseDTO {
    @IsNotEmpty()
    @IsUUID()
    assignmentId!: string;

    @IsNotEmpty()
    @IsUUID()
    questionId!: string;

    @IsNotEmpty()
    @IsEnum(['YES', 'NO', 'MAYBE'])
    response!: 'YES' | 'NO' | 'MAYBE';
}

export class FetchResultDTO {
    @IsNotEmpty()
    @IsUUID()
    assessmentId!: string;
}

export class FetchAssessmentQuestionsDTO {
    @IsNotEmpty()
    @IsUUID()
    assessmentId!: string;
}