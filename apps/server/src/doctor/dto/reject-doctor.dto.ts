import { IsString } from "class-validator";

export class rejectDoctor {
    @IsString()
    applicationId: string
}