import type { SampleSignature } from "../features/signature-management/types";
import { API_URL, requestJson } from "./employee/core";

interface SignatureApiDto {
  id?: number;
  Id?: number;
  name?: string | null;
  Name?: string | null;
  imageUrl?: string | null;
  ImageUrl?: string | null;
  isDefault?: boolean;
  IsDefault?: boolean;
  displayType?: string | null;
  DisplayType?: string | null;
  createdAt?: string | null;
  CreatedAt?: string | null;
  updatedAt?: string | null;
  UpdatedAt?: string | null;
}

const normalizeWatermarkConfig = (
  value: string | null | undefined,
): SampleSignature["watermarkConfig"] => {
  if (value === "image_only" || value === "info_only") {
    return value;
  }

  return "both";
};

const mapSignatureDto = (
  employeeId: number,
  dto: SignatureApiDto,
): SampleSignature => {
  const createdAt = dto.createdAt ?? dto.CreatedAt ?? new Date().toISOString();
  const updatedAt = dto.updatedAt ?? dto.UpdatedAt ?? createdAt;

  return {
    id: String(dto.id ?? dto.Id ?? ""),
    employeeId,
    name: dto.name ?? dto.Name ?? "",
    imageUrl: dto.imageUrl ?? dto.ImageUrl ?? "",
    createdAt,
    updatedAt,
    isDefault: Boolean(dto.isDefault ?? dto.IsDefault),
    watermarkConfig: normalizeWatermarkConfig(dto.displayType ?? dto.DisplayType),
  };
};

const toSignatureId = (id: string): number => {
  const parsedId = Number(id);
  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    throw new Error("Id chữ ký không hợp lệ.");
  }

  return parsedId;
};

export const signatureService = {
  async getSignatures(employeeId?: number): Promise<SampleSignature[]> {
    if (!employeeId) {
      return [];
    }

    const response = await requestJson<SignatureApiDto[]>(
      `${API_URL}/signatures/employee/${employeeId}`,
      { method: "GET" },
      "Không thể tải danh sách chữ ký",
    );

    return response.map((item) => mapSignatureDto(employeeId, item));
  },

  async createSignature(
    employeeId: number,
    name: string,
    imageUrl: string,
    watermarkConfig: SampleSignature["watermarkConfig"],
  ): Promise<SampleSignature> {
    const existingSignatures = await this.getSignatures(employeeId);
    const shouldSetDefault = existingSignatures.length === 0;

    await requestJson<{ Message?: string }>(
      `${API_URL}/signatures`,
      {
        method: "POST",
        body: JSON.stringify({
          employeeId,
          name: name.trim(),
          base64Data: imageUrl,
          isDefault: shouldSetDefault,
          displayType: watermarkConfig,
          certificationInfo: null,
        }),
      },
      "Không thể tạo chữ ký mới",
    );

    const latestSignatures = await this.getSignatures(employeeId);
    return latestSignatures[0];
  },

  async deleteSignature(id: string): Promise<void> {
    await requestJson<{ Message?: string }>(
      `${API_URL}/signatures/${toSignatureId(id)}`,
      { method: "DELETE" },
      "Không thể xóa chữ ký",
    );
  },

  async setDefault(employeeId: number, id: string): Promise<void> {
    await requestJson<{ Message?: string }>(
      `${API_URL}/signatures/${toSignatureId(id)}/set-default?employeeId=${employeeId}`,
      { method: "PUT" },
      "Không thể đặt chữ ký mặc định",
    );
  },
};
