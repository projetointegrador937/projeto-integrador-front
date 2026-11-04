import api from './api';
import type { AgendamentoDiaDto, AgendaParams, Appointment, Availability, CreateAppointmentRequest, PagedResultDto, RescheduleAppointmentRequest } from '../interfaces/api';

const base = '/api/v1/appointments';
export const appointmentService = {
  mine: () => api.get<PagedResultDto<Appointment>>(`${base}/mine`),
  monthlyAgenda: (params?: AgendaParams) => api.get<Array<{ date: string; totalAppointments: number; appointments: Appointment[] }>>(`${base}/schedule`, { params }),
  dailyAgenda: (day: string, params?: Omit<AgendaParams, 'month' | 'year'>) => api.get<AgendamentoDiaDto>(`${base}/schedule/${day}`, { params }),
  create: (payload: CreateAppointmentRequest) => api.post<Appointment>(base, payload),
  reschedule: (id: string, payload: RescheduleAppointmentRequest) => api.put<Appointment>(`${base}/${id}/reschedule`, payload),
  cancel: (id: string) => api.patch<Appointment>(`${base}/${id}/cancel`),
};

export const availabilityService = {
  byEstablishment: (establishmentId: string, params?: Record<string, unknown>) =>
    api.get<Availability[]>(`/api/v1/establishments/${establishmentId}/availability`, { params }),
};
