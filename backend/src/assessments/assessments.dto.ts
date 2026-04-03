import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateAssessmentDTO {
    @IsNotEmpty()
    @IsUUID()
    userId!: string;
}