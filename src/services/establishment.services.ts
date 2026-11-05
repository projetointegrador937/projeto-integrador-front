import api from './api';
import type { Availability, AvailabilityParams, BarberShopDto, EnderecoDto, CreateBarberShopPayload, Employee, Establishment, EstablishmentRequest, EstablishmentSearchParams, EstabelecimentoDetalheDto, PagedResultDto, Service, ServiceRequest } from '../interfaces/api';

const base = '/api/v1/establishments';

type ApiListResponse<T> = T[] | { data?: T[] };

function unwrapList<T>(response: ApiListResponse<T>): T[] {
  return Array.isArray(response) ? response : (response.data ?? []);
}

function normalizeEmployee(item: Employee & { name?: string; phone?: string; role?: string; isActive?: boolean }): Employee {
  return {
    ...item,
    nome: item.nome ?? item.name ?? '',
    telefone: item.telefone ?? item.phone ?? '',
    funcao: item.funcao ?? item.role ?? '',
    ativo: item.ativo ?? item.isActive ?? true,
  };
}

function normalizeEstablishment(item: Establishment & { legalName?: string; tradeName?: string; phone?: string; businessHours?: string; address?: EnderecoDto | Record<string, unknown>; isActive?: boolean; createdAt?: string }): Establishment {
  const rawAddress = item.address
  const address = rawAddress && !('rua' in rawAddress)
    ? {
      rua: String(rawAddress.street ?? ''),
      numero: String(rawAddress.number ?? ''),
      complemento: String(rawAddress.additionalInfo ?? ''),
      bairro: String(rawAddress.neighborhood ?? ''),
      cidade: String(rawAddress.city ?? ''),
      estado: String(rawAddress.state ?? ''),
      cep: String(rawAddress.postalCode ?? ''),
      latitude: typeof rawAddress.latitude === 'number' ? rawAddress.latitude : undefined,
      longitude: typeof rawAddress.longitude === 'number' ? rawAddress.longitude : undefined,
    }
    : (rawAddress as EnderecoDto | undefined)

  return {
    ...item,
    razaoSocial: item.razaoSocial ?? item.legalName ?? item.tradeName ?? '',
    nomeFantasia: item.nomeFantasia ?? item.tradeName ?? item.legalName ?? '',
    telefone: item.telefone ?? item.phone ?? '',
    email: item.email ?? '',
    descricao: item.descricao ?? '',
    horarioFuncionamento: item.horarioFuncionamento ?? item.businessHours ?? '',
    ativo: item.ativo ?? item.isActive ?? true,
    endereco: address ?? { rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' },
    criadoEm: item.criadoEm ?? item.createdAt ?? '',
  }
}

function normalizeService(item: Service & { establishmentId?: string; name?: string; description?: string; durationMinutes?: number; price?: number; isActive?: boolean }): Service {
  return {
    ...item,
    estabelecimentoId: item.estabelecimentoId ?? item.establishmentId ?? '',
    nome: item.nome ?? item.name ?? '',
    descricao: item.descricao ?? item.description ?? '',
    duracaoMinutos: item.duracaoMinutos ?? item.durationMinutes ?? 0,
    preco: item.preco ?? item.price ?? 0,
    ativo: item.ativo ?? item.isActive ?? true,
  };
}

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
  list: async (params?: EstablishmentSearchParams) => {
    const response = await api.get<PagedResultDto<Establishment> | Establishment[]>(base, { params })
    const payload = response.data
    if (Array.isArray(payload)) {
      return { ...response, data: payload.map((item) => normalizeEstablishment(item as Establishment & { tradeName?: string; phone?: string; businessHours?: string; address?: EnderecoDto | Record<string, unknown>; isActive?: boolean; createdAt?: string }) as Establishment) }
    }
    return {
      ...response,
      data: { ...payload, data: (payload.data ?? []).map((item) => normalizeEstablishment(item as Establishment & { tradeName?: string; phone?: string; businessHours?: string; address?: EnderecoDto | Record<string, unknown>; isActive?: boolean; createdAt?: string }) as Establishment) },
    }
  },
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
    legalName: payload.legalName || payload.tradeName,
    tradeName: payload.tradeName || payload.legalName,
    address: mapAddress(payload.address),
  }),
  listBarbershops: () => api.get<BarberShopDto[]>('/api/v1/establishments'),
  update: (id: string, payload: EstablishmentRequest) => api.put<Establishment>(`${base}/${id}`, {
    ...payload,
    address: mapAddress(payload.address),
  }),
  employees: async (id: string) => {
    const response = await api.get<ApiListResponse<Employee>>(`${base}/${id}/employees`);
    return { ...response, data: unwrapList(response.data).map(normalizeEmployee) };
  },
  updateEmployee: async (establishmentId: string, employeeId: string, payload: { name: string; email: string; phone: string; role: string }) => {
    const response = await api.put<Employee>(`${base}/${establishmentId}/employees/${employeeId}`, {
      ...payload,
      commissionPercentage: 0,
    });
    return { ...response, data: normalizeEmployee(response.data as Employee & { name?: string; phone?: string; role?: string; isActive?: boolean }) };
  },
  services: async (id: string) => {
    const response = await api.get<ApiListResponse<Service>>(`${base}/${id}/services`);
    return { ...response, data: unwrapList(response.data).map(normalizeService) };
  },
  createService: async (id: string, payload: ServiceRequest) => {
    const response = await api.post<Service>(`${base}/${id}/services`, {
    establishmentId: id,
    name: payload.nome,
    description: payload.descricao,
    durationMinutes: payload.duracaoMinutos,
    price: payload.preco,
    });
    return { ...response, data: normalizeService(response.data as Service & { name?: string; durationMinutes?: number; price?: number; isActive?: boolean }) };
  },
  updateService: async (establishmentId: string, serviceId: string, payload: ServiceRequest) => {
    const response = await api.put<Service>(`${base}/${establishmentId}/services/${serviceId}`, {
      establishmentId,
      name: payload.nome,
      description: payload.descricao,
      durationMinutes: payload.duracaoMinutos,
      price: payload.preco,
      });
      return { ...response, data: normalizeService(response.data as Service & { name?: string; durationMinutes?: number; price?: number; isActive?: boolean }) };
    },
    deactivateService: (establishmentId: string, serviceId: string) =>
    api.patch<string>(`${base}/${establishmentId}/services/${serviceId}/status`),
  availability: async (id: string, params: AvailabilityParams) => {
    const response = await api.get<ApiListResponse<Availability>>(`${base}/${id}/availability`, { params });
    return { ...response, data: unwrapList(response.data) };
  },
};
