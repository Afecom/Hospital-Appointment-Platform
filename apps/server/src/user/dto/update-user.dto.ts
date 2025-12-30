import { IsString, IsOptional, IsEmail, IsUrl, IsEnum } from 'class-validator'

export class UpdateUserDto {
    @IsString()
    fullName: string

    @IsEmail()
    @IsOptional()
    email?: string

    @IsString()
    @IsOptional()
    dateOfBirth?: string

    @IsString()
    @IsOptional()
    password?: string

    @IsUrl()
    @IsOptional()
    imageUrl?: string

    @IsString()
    @IsOptional()
    imageId?: string

    @IsEnum(["male", "female"])
    gender: "male" | "female"
}