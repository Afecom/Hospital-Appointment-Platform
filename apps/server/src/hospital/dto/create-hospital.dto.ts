import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEmail,
  IsUrl,
  IsMilitaryTime,
  IsBoolean,
  IsEnum,
  IsArray,
  IsOptional,
  IsLatitude,
  IsLongitude,
  IsPhoneNumber,
} from 'class-validator';
export class CreateHospitalDto {
  @IsString()
  @IsNotEmpty()
  adminId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum([
    'hospital',
    'dentalClinic',
    'dermatologyClinic',
    'diagnosticCenter',
    'clinic',
  ])
  type:
    | 'hospital'
    | 'dentalClinic'
    | 'dermatologyClinic'
    | 'diagnosticCenter'
    | 'clinic';

  @IsNumber()
  fee: number;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsPhoneNumber('ET')
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsMilitaryTime()
  @IsOptional()
  openTime: string;

  @IsMilitaryTime()
  @IsOptional()
  closeTime: string;

  @IsBoolean()
  is24Hours: boolean;

  @IsBoolean()
  emergencySupport: boolean;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsNotEmpty()
  @IsArray()
  specializationIds: string[];

  @IsString()
  bankName:
    | 'Abay Bank'
    | 'Addis International Bank'
    | 'Ahadu Bank'
    | 'Awash Bank'
    | 'Bank of Abyssinia'
    | 'Berhan Bank'
    | 'CBEBirr'
    | 'Cooperative Bank of Oromia (COOP)'
    | 'Coopay-Ebirr'
    | 'Dashen Bank'
    | 'Global Bank Ethiopia'
    | 'Hibret Bank'
    | 'Lion International Bank'
    | 'M-Pesa'
    | 'Nib International Bank'
    | 'Oromia International Bank'
    | 'telebirr'
    | 'Wegagen Bank'
    | 'Zemen Bank';

  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  // It must match the actual account name of the customers bank
  accountName: string;
}
