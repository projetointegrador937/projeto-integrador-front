import api from './api';
import type { CreateBarberPayload, Employee, EmployeeRequest } from '../interfaces/api';

const establishmentBase = '/api/v1/establishments';

/** Operações disponíveis para funcionários no contrato atual da API. */
export const employeeService = {
  listByEstablishment: (establishmentId: string) =>
    api.get<Employee[]>(`${establishmentBase}/${establishmentId}/employees`),
  /** Cria o usuário barbeiro e o vínculo com a barbearia no back-end. */
  createEmployee: (payload: CreateBarberPayload) =>
    api.post<Employee>(`${establishmentBase}/employees`, {
      establishmentId: payload.barberShopId,
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone: payload.phone,
      profilePictureUrl: payload.profilePictureUrl,
      role: 'Barbeiro',
    }),
  create: (payload: EmployeeRequest) =>
    api.post<Employee>(`${establishmentBase}/employees`, payload),

};
