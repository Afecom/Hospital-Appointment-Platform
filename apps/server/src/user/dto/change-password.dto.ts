import { IsString, IsNotEmpty } from "class-validator";

export class changePasswordDto {
    @IsNotEmpty()
    @IsString()
    newPassword: string

    @IsNotEmpty()
    @IsString()
    currentPassword: string
}