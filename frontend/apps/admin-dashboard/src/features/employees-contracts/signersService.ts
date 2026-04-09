import { API_URL, requestJson } from '../../services/employee/core';

export interface GenerateOtpDto {
  signatureToken: string;
}

export interface VerifyOtpDto {
  signatureToken: string;
  otp: string;
}

export type SignatureMethod = 'draw' | 'type' | 'upload';

export interface SignerAssignedField {
  id: number;
  type: string;
  pageNumber: number;
  xPos: number;
  yPos: number;
  width: number;
  height: number;
}

export interface SignerAuthResponseDto {
  accessToken: string;
  signerId: number;
  fullName: string;
  email: string;
  contractId: number;
  contractNumber: string;
  status: string;
  assignedFields: SignerAssignedField[];
}

export interface CompleteSigningFieldDto {
  positionId: number;
  signatureDataUrl: string;
  signatureMethod: SignatureMethod;
}

export interface CompleteSigningDto {
  acceptedAgreement: boolean;
  fields: CompleteSigningFieldDto[];
}

interface SignerAssignedFieldApiResponse {
  id?: number;
  Id?: number;
  type?: string | null;
  Type?: string | null;
  pageNumber?: number;
  PageNumber?: number;
  xPos?: number;
  XPos?: number;
  yPos?: number;
  YPos?: number;
  width?: number;
  Width?: number;
  height?: number;
  Height?: number;
}

interface SignerAuthResponseApi {
  accessToken?: string | null;
  AccessToken?: string | null;
  signerId?: number;
  SignerId?: number;
  fullName?: string | null;
  FullName?: string | null;
  email?: string | null;
  Email?: string | null;
  contractId?: number;
  ContractId?: number;
  contractNumber?: string | null;
  ContractNumber?: string | null;
  status?: string | null;
  Status?: string | null;
  assignedFields?: SignerAssignedFieldApiResponse[];
  AssignedFields?: SignerAssignedFieldApiResponse[];
}

const normalizeAssignedField = (field: SignerAssignedFieldApiResponse): SignerAssignedField => ({
  id: field.id ?? field.Id ?? 0,
  type: field.type ?? field.Type ?? 'image-signature',
  pageNumber: field.pageNumber ?? field.PageNumber ?? 1,
  xPos: field.xPos ?? field.XPos ?? 0,
  yPos: field.yPos ?? field.YPos ?? 0,
  width: field.width ?? field.Width ?? 0.24,
  height: field.height ?? field.Height ?? 0.08,
});

const normalizeSignerAuthResponse = (response: SignerAuthResponseApi): SignerAuthResponseDto => ({
  accessToken: response.accessToken ?? response.AccessToken ?? '',
  signerId: response.signerId ?? response.SignerId ?? 0,
  fullName: response.fullName ?? response.FullName ?? '',
  email: response.email ?? response.Email ?? '',
  contractId: response.contractId ?? response.ContractId ?? 0,
  contractNumber: response.contractNumber ?? response.ContractNumber ?? '',
  status: response.status ?? response.Status ?? '',
  assignedFields: (response.assignedFields ?? response.AssignedFields ?? []).map(normalizeAssignedField),
});

const generateOtp = async (dto: GenerateOtpDto) =>
  requestJson<{ message?: string }>(
    `${API_URL}/signers/generate-otp`,
    {
      method: 'POST',
      body: JSON.stringify(dto),
    },
    "Không thể gửi mã xác thực",
  );

const verifyOtpRaw = async (dto: VerifyOtpDto) =>
  requestJson<SignerAuthResponseApi>(
    `${API_URL}/signers/verify-otp`,
    {
      method: 'POST',
      body: JSON.stringify(dto),
    },
    "Xác thực mã OTP thất bại",
  );

const verifyOtp = async (dto: VerifyOtpDto) => normalizeSignerAuthResponse(await verifyOtpRaw(dto));

const completeSigning = async (dto: CompleteSigningDto, accessToken: string) =>
  requestJson<{ isCompleted?: boolean; contractFullySigned?: boolean; notifiedNextSigner?: boolean }>(
    `${API_URL}/signers/complete-signing`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(dto),
    },
    'Hoan tat ky that bai',
  );

export const signersService = {
  generateOtp,
  verifyOtp,
  completeSigning,
};
