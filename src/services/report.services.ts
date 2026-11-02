import api from './api';
import type { RelatorioAtendimentosDto, RelatorioComissaoDto, ReportParams } from '../interfaces/api';

export const reportService = {
  commissions: (params?: Pick<ReportParams, 'mes' | 'ano' | 'funcionarioId'>) => api.get<RelatorioComissaoDto>('/api/v1/relatorios/comissoes', { params }),
  attendances: (params?: Pick<ReportParams, 'inicio' | 'fim'>) => api.get<RelatorioAtendimentosDto>('/api/v1/relatorios/atendimentos', { params }),
};
