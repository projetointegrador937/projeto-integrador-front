import api from './api';
import { authService } from './auth.services';
import type { CreateBarberPayload, Employee, EmployeeRequest } from '../interfaces/api';

const establishmentBase = '/api/v1/establishments';

/** Operações disponíveis para funcionários no contrato atual da API. */
export const employeeService = {
  listByEstablishment: (establishmentId: string) =>
    api.get<Employee[]>(`${establishmentBase}/${establishmentId}/employees`),
  /** Cria o usuário barbeiro e o vincula ao estabelecimento em dois passos. */
  createEmployee: async (payload: CreateBarberPayload) => {
    // Passo 1: criar usuário com role Barbeiro
    const userResp = await authService.createBarberUser({
      email: payload.email,
      password: payload.password,
      name: payload.name,
      profilePictureUrl: payload.profilePictureUrl,
    });
    // Passo 2: vincular ao estabelecimento
    return api.post<Employee>(`${establishmentBase}/employees`, {
      establishmentId: payload.barberShopId,
      userId: userResp.data.id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: 'Barbeiro',
      commissionPercentage: payload.commission,
    });
  },
  create: (payload: EmployeeRequest) =>
    api.post<Employee>(`${establishmentBase}/employees`, payload),

};
