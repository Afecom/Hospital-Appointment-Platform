import { IsInt, IsEnum, IsString } from "class-validator";

export class approveDoctor {
    @IsEnum(["permanent", "rotating"])
    doctorType: "permanent" | "rotating"

    @IsInt()
    slotDuration: number

    @IsString()
    applicationId: string
}