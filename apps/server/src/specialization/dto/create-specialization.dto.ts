import { IsString, IsNotEmpty, IsOptional } from 'class-validator'
export class CreateSpecializationDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsString()
    @IsOptional()
    imageURL?: string;
}