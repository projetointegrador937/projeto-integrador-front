import api from './api';
import type { Service, ServiceRequest } from '../interfaces/api';

const legacyBase = '/api/establishiment';
const establishmentBase = '/api/v1/estabelecimentos';

/** Operações disponíveis para serviços no contrato atual da API. */
export const serviceService = {
  listByEstablishment: (establishmentId: string) =>
    api.get<Service[]>(`${establishmentBase}/${establishmentId}/servicos`),
  listLegacy: () => api.get<Service[]>(`${legacyBase}/get-services`),
  create: (payload: ServiceRequest) =>
    api.post<Service>(`${legacyBase}/create-service`, payload),
  getLegacy: (barberShopId: string, id: string) =>
    api.get<Service>(`${legacyBase}/get-service`, { params: { barberShopId, id } }),
};
