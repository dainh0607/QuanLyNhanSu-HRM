const FIRST_NAMES = [
  "Nguyen",
  "Tran",
  "Le",
  "Pham",
  "Vo",
  "Dang",
  "Ho",
  "Bui",
  "Do",
  "Duong",
] as const;

const MIDDLE_NAMES = [
  "Minh",
  "Thu",
  "Gia",
  "Quoc",
  "Hoang",
  "Thanh",
  "Ngoc",
  "Bao",
  "Kim",
  "Anh",
] as const;

const LAST_NAMES = [
  "Anh",
  "Trang",
  "Nam",
  "Linh",
  "Khanh",
  "Vy",
  "Huy",
  "Phuong",
  "Nhi",
  "Quan",
] as const;

export interface QuickAddEmployeeSampleData {
  fullName: string;
  phone: string;
}

export const createSampleEmployeeData = (
  seed: number,
): QuickAddEmployeeSampleData => {
  const normalizedSeed = Math.max(0, seed);
  const firstName = FIRST_NAMES[normalizedSeed % FIRST_NAMES.length];
  const middleName =
    MIDDLE_NAMES[Math.floor(normalizedSeed / FIRST_NAMES.length) % MIDDLE_NAMES.length];
  const lastName =
    LAST_NAMES[
      Math.floor(normalizedSeed / (FIRST_NAMES.length * MIDDLE_NAMES.length)) %
        LAST_NAMES.length
    ];
  const phoneSuffix = String(100000000 + (normalizedSeed % 899999999))
    .padStart(9, "0")
    .slice(-9);

  return {
    fullName: `${firstName} ${middleName} ${lastName}`,
    phone: `0${phoneSuffix}`,
  };
};
