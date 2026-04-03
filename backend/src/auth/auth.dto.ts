import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterDTO {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;
}