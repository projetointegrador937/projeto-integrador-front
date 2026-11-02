import api from './api';
import type { CreateBarberUserPayload, CreateBarbershopOwnerRequest, CreateUserRequest, LoginRequest, LoginResponse, LogoutRequest, RefreshTokenPayload, UpdateUserRequest, User, UserSummaryDto, UsuarioResumo } from '../interfaces/api';

export const authService = {
  login: (payload: LoginRequest) => api.post<LoginResponse>('/api/v1/auth/login', payload),
  logout: (payload: LogoutRequest) => api.post<void>('/api/v1/auth/logout', payload),
  refresh: (payload: RefreshTokenPayload) => api.post<LoginResponse>('/api/v1/auth/refresh', payload),
  createUser: (payload: CreateUserRequest) => api.post<User>('/api/users/create-user', payload),
  createBarbershopOwner: (payload: CreateBarbershopOwnerRequest) => api.post<User>('/api/users/create-barbershop-owner', payload),

  createBarberUser: (payload: CreateBarberUserPayload) => api.post<UserSummaryDto>('/api/users/create-barber', payload),

  updateUser: (payload: UpdateUserRequest) => api.put<User>('/api/users/update-user', payload),
  getCurrentUser: () => api.get<UsuarioResumo>('/api/users/me'),
};
