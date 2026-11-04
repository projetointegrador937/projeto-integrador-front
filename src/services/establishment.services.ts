import api from './api';
import type { Availability, AvailabilityParams, BarberShopDto, EnderecoDto, CreateBarberShopPayload, Employee, Establishment, EstablishmentRequest, EstablishmentSearchParams, EstabelecimentoDetalheDto, PagedResultDto, Service, ServiceRequest } from '../interfaces/api';

const base = '/api/v1/establishments';

function mapAddress(address: EnderecoDto) {
  return {
    street: address.rua,
    number: address.numero,
    additionalInfo: address.complemento,
    neighborhood: address.bairro,
    city: address.cidade,
    state: address.estado,
    postalCode: address.cep,
    latitude: address.latitude,
    longitude: address.longitude,
  }
}
export const establishmentService = {
  list: (params?: EstablishmentSearchParams) => api.get<PagedResultDto<Establishment> | Establishment[]>(base, { params }),
  getById: (id: string) => api.get<EstabelecimentoDetalheDto>(`${base}/${id}`),
  create: (payload: EstablishmentRequest) => api.post<Establishment>(base, {
    tradeName: payload.tradeName,
    phone: payload.phone,
    email: payload.email,
    businessHours: payload.businessHours,
    address: mapAddress(payload.address),
  }),
  createBarbershop: (payload: CreateBarberShopPayload) => api.post<Establishment>('/api/v1/establishments', {
    ...payload,
    address: mapAddress(payload.address),
  }),
  listBarbershops: () => api.get<BarberShopDto[]>('/api/v1/establishments'),
  update: (id: string, payload: EstablishmentRequest) => api.put<Establishment>(`${base}/${id}`, {
    ...payload,
    address: mapAddress(payload.address),
  }),
  employees: (id: string) => api.get<Employee[]>(`${base}/${id}/employees`),
  services: (id: string) => api.get<Service[]>(`${base}/${id}/services`),
  createService: (id: string, payload: ServiceRequest) => api.post<Service>(`${base}/${id}/services`, {
    establishmentId: id,
    name: payload.nome,
    description: payload.descricao,
    durationMinutes: payload.duracaoMinutos,
    price: payload.preco,
  }),
  updateService: (establishmentId: string, serviceId: string, payload: ServiceRequest) =>
    api.put<Service>(`${base}/${establishmentId}/services/${serviceId}`, {
      establishmentId,
      name: payload.nome,
      description: payload.descricao,
      durationMinutes: payload.duracaoMinutos,
      price: payload.preco,
    }),
  availability: (id: string, params: AvailabilityParams) => api.get<Availability[]>(`${base}/${id}/availability`, { params }),
};
