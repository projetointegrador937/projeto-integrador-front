import api from './api';
import type { AgendamentoDiaDto, AgendaParams, Appointment, Availability, CreateAppointmentRequest, RescheduleAppointmentRequest } from '../interfaces/api';

const base = '/api/v1/agendamentos';
export const appointmentService = {
  mine: () => api.get<Appointment[]>(`${base}/meus`),
  monthlyAgenda: (params?: AgendaParams) => api.get<Appointment[]>(`${base}/agenda`, { params }),
  dailyAgenda: (day: string, params?: Omit<AgendaParams, 'mes' | 'ano'>) => api.get<AgendamentoDiaDto>(`${base}/agenda/${day}`, { params }),
  create: (payload: CreateAppointmentRequest) => api.post<Appointment>(base, payload),
  reschedule: (id: string, payload: RescheduleAppointmentRequest) => api.put<Appointment>(`${base}/${id}/remarcar`, payload),
  cancel: (id: string) => api.patch<Appointment>(`${base}/${id}/cancelar`),
};

export const availabilityService = {
  legacy: (params?: Record<string, unknown>) => api.get<Availability[]>('/api/Appointment/get-barbers-schedule', { params }),
};
