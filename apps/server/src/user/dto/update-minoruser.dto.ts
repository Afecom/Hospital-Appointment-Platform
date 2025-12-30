import { IsString, IsOptional, IsEmail, IsUrl, IsEnum } from 'class-validator'

export class updateMinorUser {
    @IsOptional()
    @IsString()
    fullName?: string

    @IsOptional()
    @IsString()
    gender?: string

    @IsOptional()
    @IsUrl()
    imageUrl?: string

    @IsOptional()
    @IsString()
    imageId?: string
}