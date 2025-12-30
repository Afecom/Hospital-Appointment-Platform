declare const AppointmentStatus: {
    readonly pending: "pending";
    readonly approved: "approved";
    readonly rejected: "rejected";
};
type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];
declare const DoctorApplicationStatus: {
    readonly pending: "pending";
    readonly approved: "approved";
    readonly rejected: "rejected";
};
type DoctorApplicationStatus = (typeof DoctorApplicationStatus)[keyof typeof DoctorApplicationStatus];
declare const DoctorType: {
    readonly permanent: "permanent";
    readonly rotating: "rotating";
};
type DoctorType = (typeof DoctorType)[keyof typeof DoctorType];
declare const HospitalType: {
    readonly hospital: "hospital";
    readonly dentalClinic: "dentalClinic";
    readonly dermatologyClinic: "dermatologyClinic";
    readonly diagnosticCenter: "diagnosticCenter";
    readonly clinic: "clinic";
};
type HospitalType = (typeof HospitalType)[keyof typeof HospitalType];
declare const Role: {
    readonly admin: "admin";
    readonly user: "user";
    readonly hospital_admin: "hospital_admin";
    readonly hospital_operator: "hospital_operator";
    readonly hospital_user: "hospital_user";
    readonly doctor: "doctor";
};
type Role = (typeof Role)[keyof typeof Role];
declare const SchedulePeriod: {
    readonly morning: "morning";
    readonly afternoon: "afternoon";
    readonly evening: "evening";
};
type SchedulePeriod = (typeof SchedulePeriod)[keyof typeof SchedulePeriod];
declare const ScheduleStatus: {
    readonly pending: "pending";
    readonly approved: "approved";
    readonly rejected: "rejected";
};
type ScheduleStatus = (typeof ScheduleStatus)[keyof typeof ScheduleStatus];
declare const ScheduleType: {
    readonly recurring: "recurring";
    readonly temporary: "temporary";
    readonly one_time: "one_time";
};
type ScheduleType = (typeof ScheduleType)[keyof typeof ScheduleType];
declare const SlotStatus: {
    readonly available: "available";
    readonly booked: "booked";
    readonly cancelled: "cancelled";
    readonly expired: "expired";
};
type SlotStatus = (typeof SlotStatus)[keyof typeof SlotStatus];
declare const gender: {
    readonly male: "male";
    readonly female: "female";
};
type gender = (typeof gender)[keyof typeof gender];

type enums_AppointmentStatus = AppointmentStatus;
type enums_DoctorApplicationStatus = DoctorApplicationStatus;
type enums_DoctorType = DoctorType;
type enums_HospitalType = HospitalType;
type enums_Role = Role;
type enums_SchedulePeriod = SchedulePeriod;
type enums_ScheduleStatus = ScheduleStatus;
type enums_ScheduleType = ScheduleType;
type enums_SlotStatus = SlotStatus;
type enums_gender = gender;
declare namespace enums {
  export type { enums_AppointmentStatus as AppointmentStatus, enums_DoctorApplicationStatus as DoctorApplicationStatus, enums_DoctorType as DoctorType, enums_HospitalType as HospitalType, enums_Role as Role, enums_SchedulePeriod as SchedulePeriod, enums_ScheduleStatus as ScheduleStatus, enums_ScheduleType as ScheduleType, enums_SlotStatus as SlotStatus, enums_gender as gender };
}

export { AppointmentStatus as A, DoctorApplicationStatus as D, HospitalType as H, Role as R, SchedulePeriod as S, DoctorType as a, ScheduleStatus as b, ScheduleType as c, SlotStatus as d, enums as e, gender as g };
