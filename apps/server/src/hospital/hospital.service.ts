import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { CreateHospitalDto } from './dto/create-hospital.dto.js';
import { UpdateHospitalDto } from './dto/update-hospital.dto.js';
import { chapaAxios } from '../lib/chapaaxios.js';

@Injectable()
export class HospitalService {
  constructor(private databaseService: DatabaseService) {}

  async create(DTO: CreateHospitalDto, logoUrl: string, logoId: string) {
    const { specializationIds, accountName, accountNumber, bankName, ...rest } =
      DTO;
    const chapaBanks = (await chapaAxios.get('/banks')).data;
    const bankCode = chapaBanks.data.find(
      (bank: any) => bank.name === bankName,
    )?.id;

    if (!bankCode) {
      throw new BadRequestException(`Bank '${bankName}' not found.`);
    }
    let subAccount;
    try {
      const payload = {
        business_name: DTO.name,
        account_name: DTO.accountName,
        bank_code: bankCode,
        account_number: String(DTO.accountNumber),
        split_type: 'flat',
        split_value: 25,
      };
      subAccount = (await chapaAxios.post('/subaccount', payload)).data;
    } catch (err: any) {
      console.error('Chapa createSubaccount error:', err);
      let errMsg = err?.response?.data?.message || err?.response?.data;

      if (!errMsg && typeof err.getResponse === 'function') {
        const response = err.getResponse();
        errMsg = (response as any)?.message || response;
      }

      errMsg = errMsg || err?.message || 'Unknown error creating subaccount';
      throw new BadRequestException(
        `Chapa subaccount creation failed: ${typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg}`,
      );
    }
    const subAccountId = subAccount.data.subaccount_id as string;
    const hospital = await this.databaseService.hospital.create({
      data: {
        ...rest,
        logoUrl,
        logoId,
        subAccountId: subAccountId,
        HospitalSpecialization: {
          create: specializationIds.map((id) => ({
            Specialization: { connect: { id } },
          })),
        },
      },
    });
    return {
      message: 'Hospital created successfully',
      status: 'success',
      data: hospital,
    };
  }

  async findAll() {
    const hospitals = await this.databaseService.hospital.findMany();
    if (hospitals.length === 0)
      throw new NotFoundException("Couldn't find any hospitals");
    return hospitals;
  }

  async findOne(id: string) {
    const hospital = await this.databaseService.hospital.findUniqueOrThrow({
      where: { id },
      include: { HospitalSpecialization: true },
    });
    return hospital;
  }

  async update(id: string, DTO: UpdateHospitalDto) {
    const { specializationIds, ...rest } = DTO;
    const updated_hospital = await this.databaseService.hospital.update({
      where: { id },
      data: {
        ...rest,
        ...(specializationIds && {
          specializations: {
            set: specializationIds.map((id) => ({ id })),
          },
        }),
      },
      include: { HospitalSpecialization: true },
    });
    return updated_hospital;
  }

  async remove(id: string) {
    await this.databaseService.hospital.delete({ where: { id } });
  }

  async findAllBySpecialization(id: string) {
    const hospitals = await this.databaseService.hospital.findMany({
      where: {
        HospitalSpecialization: {
          some: { specializationId: id },
        },
      },
      include: { HospitalSpecialization: true },
    });
    if (hospitals.length === 0)
      throw new NotFoundException(
        "Couldn't find hospitals with the provided specialization id",
      );
    return hospitals;
  }
}
