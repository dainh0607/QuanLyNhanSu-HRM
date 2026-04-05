import { API_URL, requestJson } from '../../services/employee/core';

export interface GenerateOtpDto {
  SignatureToken: string;
}

export interface VerifyOtpDto {
  SignatureToken: string;
  Otp: string;
}

export interface SignerAuthResponseDto {
  AccessToken: string;
  FullName: string;
  Email: string;
  ContractId: number;
}

const generateOtp = async (dto: GenerateOtpDto) =>
  requestJson<{ message?: string }>(
    `${API_URL}/signers/generate-otp`,
    {
      method: "POST",
      body: JSON.stringify(dto),
    },
    "Không thể gửi mã xác thực",
  );

const verifyOtp = async (dto: VerifyOtpDto) =>
  requestJson<SignerAuthResponseDto>(
    `${API_URL}/signers/verify-otp`,
    {
      method: "POST",
      body: JSON.stringify(dto),
    },
    "Xác thực mã OTP thất bại",
  );

export const signersService = {
  generateOtp,
  verifyOtp,
};
