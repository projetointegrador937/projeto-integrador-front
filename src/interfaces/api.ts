export interface ApiError {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface PagedResultDto<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface EnderecoDto {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude?: number;
  longitude?: number;
  cep: string;
}

export interface UsuarioResumo {
  id: string;
  nome: string;
  contato: string | null;
  endereco: EnderecoUsuario | null;
}

export interface EnderecoUsuario {
  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  latitude: number | null;
  longitude: number | null;
}

export type UserType = string;
export interface UsuarioDto {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  tipo: UserType;
  profilePictureUrl: string;
}

export type User = UsuarioDto;
export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioDto;
}

export type LoginResponse = AuthResponseDto;
export interface LoginRequest { email: string; password: string }
export interface LogoutRequest { refreshToken: string }
export interface RefreshTokenPayload { refreshToken: string }
export interface CreateUserRequest { name: string; email: string; password: string }
export interface CreateBarbershopOwnerRequest { name: string; email: string; password: string }
export interface BusinessHoursInput {
  dayOfWeek: DayOfWeek;
  start: string;
  end: string;
  breakStart?: string | null;
  breakEnd?: string | null;
}

export interface CreateBarberShopPayload {
  legalName: string;
  tradeName: string;
  cnpj: string;
  stateRegistration?: string;
  phone: string;
  email: string;
  businessHours: BusinessHoursInput[];
  address: EnderecoDto;
}

export type CriarBarbeariaPayload = CreateBarberShopPayload;
export type HorarioFuncionamento = BusinessHoursInput;

export const DayOfWeek = {
  Domingo: 0,
  Segunda: 1,
  Terca: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
  Sabado: 6,
} as const;

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];
export interface AtualizarUsuarioPayload {
  nome: string;
  email: string;
  telefone?: string | null;
  profilePictureUrl?: string | null;
  endereco?: EnderecoUsuarioPayload;
}

export interface EnderecoUsuarioPayload {
  rua: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  latitude?: number | null;
  longitude?: number | null;
}

export type UpdateUserRequest = AtualizarUsuarioPayload;


export interface EstabelecimentoDto {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  telefone: string;
  email: string;
  descricao: string;
  horarioFuncionamento: string;
  ativo: boolean;
  endereco: EnderecoDto;
  criadoEm: string;
}

export interface EstabelecimentoDetalheDto extends EstabelecimentoDto {
  servicos: ServicoDto[];
  funcionarios: FuncionarioDto[];
}

export type Establishment = EstabelecimentoDto;

export interface EstablishmentRequest {
  tradeName: string;
  phone: string;
  email: string;
  businessHours: string;
  address: EnderecoDto;
}
export type EstabelecimentoRequest = EstablishmentRequest;
export interface EstablishmentSearchParams { busca?: string; endereco?: string; cidade?: string; page?: number; size?: number }

export interface FuncionarioDto {
  id: string;
  estabelecimentoId: string;
  usuarioId: string;
  nome: string;
  email: string;
  telefone: string;
  funcao: string;
  percentualComissao: number;
  ativo: boolean;
  criadoEm: string;
}
export type Employee = FuncionarioDto;
export type EmployeeRequest = Partial<FuncionarioDto>;

export interface CreateBarberPayload {
  email: string;
  password: string;
  profilePictureUrl: string;
  name: string;
  phone: string;
  barberShopId: string;
}

export interface CreateBarberUserPayload {
  email: string;
  password: string;
  name: string;
  profilePictureUrl: string;
}

export interface UserSummaryDto {
  id: string;
  name: string;
  contact: string | null;
}

export interface ServicoDto {
  id: string;
  estabelecimentoId: string;
  nome: string;
  descricao?: string;
  duracaoMinutos: number;
  preco: number;
  ativo: boolean;
}
export type Service = ServicoDto;
export type ServiceRequest = Partial<ServicoDto>;

export interface HorarioDisponivelDto { horario: string; disponivel: boolean }
export type Availability = HorarioDisponivelDto;
export interface AvailabilityParams { date: string; employeeId?: string; serviceId?: string }

export type StatusAgendamento = string;
export interface AgendamentoDto {
  id: string;
  clienteId: string;
  nomeCliente?: string;
  clienteNome?: string;
  estabelecimentoId: string;
  nomeEstabelecimento: string;
  enderecoEstabelecimento?: EnderecoDto | string | null;
  endereco?: EnderecoDto | string | null;
  telefoneEstabelecimento?: string | null;
  funcionarioId: string;
  nomeFuncionario: string;
  servicoId: string;
  nomeServico: string;
  dataHora: string;
  status: StatusAgendamento;
  observacoes?: string;
  valorTotal: number;
  numeroReserva?: string;
  criadoEm: string;
}
export type Appointment = AgendamentoDto;
export interface AgendamentoDiaDto { dia: string; totalAgendamentos: number; agendamentos: AgendamentoDto[] }
export interface CreateAppointmentRequest { clientId?: string; establishmentId: string; employeeId: string; serviceId: string; dateTime: string; notes?: string }
export interface RescheduleAppointmentRequest { newDateTime: string }
export interface AgendaParams { month?: number; year?: number; employeeId?: string }

export type StatusContato = string;
export interface ContatoDto {
  id: string;
  assunto: string;
  nome: string;
  sobrenome: string;
  email: string;
  numeroReserva?: string;
  descricao: string;
  status: StatusContato;
  criadoEm: string;
}
export type Contact = ContatoDto;
export interface ContactRequest { assunto: string; nome: string; sobrenome: string; email: string; numeroReserva?: string; descricao: string }
export interface ContactStatusRequest { status: StatusContato }

export interface ComissaoFuncionarioInfo { [key: string]: unknown }
export interface ResumoAtendimentosInfo { [key: string]: unknown }
export interface RelatorioComissaoDto { mes: number; ano: number; comissoes: ComissaoFuncionarioInfo[]; totalFaturamento: number; totalComissoes: number }
export interface RelatorioAtendimentosDto { inicio: string; fim: string; resumo: ResumoAtendimentosInfo }
export interface ReportParams { month?: number; year?: number; employeeId?: string; start?: string; end?: string }

export interface BarberShopDto { id: string; name: string; description: string; phone: string; email: string; logo: string }
export interface BarberShopServiceDto { id: string; name: string; price: number; durationInMinutes: number }
export type AppointmentStatus = string;
export interface AppointmentDto { id: string; barberId: string; serviceId: string; customerName: string; startDateTime: string; endDateTime: string; status: AppointmentStatus }
