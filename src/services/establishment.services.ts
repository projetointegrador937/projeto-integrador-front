import api from './api';
import type { Availability, AvailabilityParams, BarberShopDto, CreateBarberShopPayload, Employee, Establishment, EstablishmentRequest, EstablishmentSearchParams, EstabelecimentoDetalheDto, PagedResultDto, Service } from '../interfaces/api';

const base = '/api/v1/establishments';
export const establishmentService = {
  list: (params?: EstablishmentSearchParams) => api.get<PagedResultDto<Establishment> | Establishment[]>(base, { params }),
  getById: (id: string) => api.get<EstabelecimentoDetalheDto>(`${base}/${id}`),
  create: (payload: EstablishmentRequest) => api.post<Establishment>(base, payload),
  createBarbershop: (payload: CreateBarberShopPayload) => api.post<Establishment>('/api/establishiment/create-barbershop', payload),
  listBarbershops: () => api.get<BarberShopDto[]>('/api/establishiment'),
  update: (id: string, payload: EstablishmentRequest) => api.put<Establishment>(`${base}/${id}`, payload),
  employees: (id: string) => api.get<Employee[]>(`${base}/${id}/employees`),
  services: (id: string) => api.get<Service[]>(`${base}/${id}/services`),
  availability: (id: string, params: AvailabilityParams) => api.get<Availability[]>(`${base}/${id}/disponibilidade`, { params }),
};
