import api from './api';
import type { RelatorioAtendimentosDto, RelatorioComissaoDto, ReportParams } from '../interfaces/api';

export const reportService = {
  commissions: (params?: Pick<ReportParams, 'month' | 'year' | 'employeeId'>) => api.get<RelatorioComissaoDto>('/api/v1/reports/commissions', { params }),
  attendances: (params?: Pick<ReportParams, 'start' | 'end'>) => api.get<RelatorioAtendimentosDto>('/api/v1/reports/appointments', { params }),
};
