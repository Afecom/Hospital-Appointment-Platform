import { IsString, IsOptional, IsNotEmpty, IsInt, IsArray, isArray } from "class-validator";

export class applyDoctorDto {

    @IsString()
    @IsNotEmpty()
    hospitalId: string

    @IsInt()
    yearsOfExperience: number

    @IsOptional()
    @IsString()
    bio: string

    @IsArray()
    specializationIds: string[]
}