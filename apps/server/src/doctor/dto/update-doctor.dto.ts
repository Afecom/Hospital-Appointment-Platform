import { IsArray, IsInt, IsOptional, IsString } from "class-validator";

export class UpdateDoctorDto {
    @IsInt()
    @IsOptional()
    yearsOfExperience?: number;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsArray()
    @IsOptional()
    specializationIds?: string[]
}
