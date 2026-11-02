# Navalha & Corte — Documentação do Back-end

> Projeto Integrador — UNIVESP
> API REST para autenticação, estabelecimentos, profissionais, serviços, contatos, agenda e relatórios.

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Status da implementação](#2-status-da-implementação)
3. [Tecnologias](#3-tecnologias)
4. [Estrutura da solução](#4-estrutura-da-solução)
5. [Arquitetura](#5-arquitetura)
6. [Configuração local](#6-configuração-local)
7. [Docker Compose](#7-docker-compose)
8. [Variáveis de ambiente](#8-variáveis-de-ambiente)
9. [Execução e migrações](#9-execução-e-migrações)
10. [Autenticação e segurança](#10-autenticação-e-segurança)
11. [Mediator, CQRS e handlers](#11-mediator-cqrs-e-handlers)
12. [Endpoints implementados](#12-endpoints-implementados)
13. [Persistência e repositórios](#13-persistência-e-repositórios)
14. [DTOs e contratos de retorno](#14-dtos-e-contratos-de-retorno)
15. [Modelo de domínio](#15-modelo-de-domínio)
16. [Documentação da API](#16-documentação-da-api)
17. [Limitações e próximos passos](#17-limitações-e-próximos-passos)

---

## 1. Visão geral

O backend do Navalha & Corte é uma aplicação ASP.NET Core Web API responsável por centralizar o cadastro e a operação de estabelecimentos, profissionais, serviços e agendamentos.

A aplicação utiliza .NET 9, PostgreSQL, Entity Framework Core, JWT Bearer, BCrypt, FluentValidation, Docker Compose e o pacote `Prime.Architecture` para Mediator, mapeamento e contratos de requisição.

A API possui dois grupos de funcionalidades:

- **Fluxos principais versionados**, expostos em `/api/v1`, com comandos e queries integrados ao Mediator.
- **Fluxos legados**, mantidos em `/api/user`, `/api/barbershop` e `/api/Appointment`, também migrados para despacho via Mediator nos comandos de escrita.

> Esta documentação descreve o código existente no repositório. Requisitos de produto ainda não implementados estão listados na seção [Limitações e próximos passos](#16-limitações-e-próximos-passos).

---

## 2. Status da implementação

### Implementado

- Cadastro e login de usuários.
- Geração de access token JWT e refresh token.
- Revogação de refresh token.
- Cadastro e consulta de estabelecimentos.
- Cadastro e consulta de funcionários e serviços.
- Criação, consulta, remarcação, cancelamento e alteração de status de agendamentos.
- Consulta de agenda diária e mensal.
- Consulta de horários disponíveis.
- Envio e listagem de contatos.
- Alteração do status de contatos.
- Relatórios de comissões e atendimentos.
- Mediator para commands e queries.
- Persistência via Entity Framework Core e PostgreSQL.
- Execução local ou via Docker Compose.
- Swagger/OpenAPI em ambiente de desenvolvimento e referência Scalar.

### Ainda não evidenciado no código atual

- Integração efetiva com WhatsApp.
- Recuperação de senha por e-mail.
- Rate limiting configurado.
- CORS restrito a origens específicas.
- Redis.
- Serviço de envio de e-mails.
- Pipeline de CI/CD.
- Testes automatizados no repositório.
- Aplicação automática de migrations durante o startup.

---

## 3. Tecnologias

| Tecnologia | Versão/configuração | Uso |
|---|---:|---|
| .NET / ASP.NET Core | 9.0 | Runtime e Web API |
| C# | — | Linguagem principal |
| PostgreSQL | 16 Alpine no Docker | Banco relacional |
| Entity Framework Core | 9.0.1 | ORM e migrations |
| JWT Bearer | 9.0.9 | Autenticação |
| BCrypt.Net-Next | 4.0.3 | Hash de senhas |
| FluentValidation | 12.1.1 | Validação |
| Prime.Architecture | 2.0.0 | Mediator, requests e mapper |
| Swashbuckle | 10.1.7 | Swagger/OpenAPI |
| Scalar.AspNetCore | 2.18.0 | Referência visual da API |
| Docker / Compose | — | Containerização |

Projetos da solução:

- `ProjetoIntegradorBack.Api`
- `ProjetoIntegradorBack.Domain`
- `ProjetoIntegradorBack.Repository`
- `ProjetoIntegradorBack.Service`
- `ProjetoIntegradorBack.Shared`

---

## 4. Estrutura da solução

```text
projeto-integrador-back/
├── ProjetoIntegradorBack.Api/
│   ├── Commands/             # Commands enviados ao Mediator
│   ├── Controllers/          # Endpoints HTTP
│   ├── Handlers/             # IRequestHandler e handlers legados
│   ├── Mappings/             # Profiles do mapper
│   ├── Middlewares/          # Middlewares da API
│   ├── Queries/              # Queries enviadas ao Mediator
│   ├── Services/             # JWT e serviços de aplicação
│   ├── Validator/             # Validadores
│   ├── Program.cs
│   └── appsettings*.json
├── ProjetoIntegradorBack.Domain/
│   ├── DTOs/
│   ├── Entities/
│   ├── Enums/
│   ├── Interfaces/
│   └── ValueObjects/
├── ProjetoIntegradorBack.Repository/
│   ├── Context/
│   ├── Migrations/
│   └── Repositories/
├── ProjetoIntegradorBack.Service/
│   └── Services/
├── ProjetoIntegradorBack.Shared/
│   └── Pattern/               # Result e Failure
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── DOCUMENTACAO.md
```

---

## 5. Arquitetura

A solução segue uma separação em camadas:

```text
HTTP Request
    ↓
Controller
    ↓
Mediator.Send(command/query)
    ↓
IRequestHandler
    ↓
Service / Repository
    ↓
Entity Framework Core
    ↓
PostgreSQL
```

### API

Responsável por controllers, requests, handlers, validações, mapeamento, autenticação e configuração da aplicação.

### Domain

Contém entidades, DTOs, enums, value objects e interfaces dos repositórios e serviços.

### Repository

Implementa o `DbContext`, migrations e os repositórios concretos para acesso ao PostgreSQL.

### Service

Concentra regras de serviço, incluindo disponibilidade de profissionais e horários.

### Shared

Contém tipos compartilhados, especialmente `Result<T>` e `Failure`, usados para transportar sucesso ou falha entre as camadas.

### Inicialização

O registro atual em `Program.cs` inclui:

- Controllers.
- Autenticação JWT e autorização.
- `DbContext` com PostgreSQL.
- Repositórios como serviços scoped.
- Serviços de domínio/aplicação.
- Validators via `AddValidatorsFromAssemblyContaining<Program>()`.
- Mediator via `AddMediatorStandard(typeof(Program).Assembly)`.
- Mapper via `MapperConfiguration`.
- Swagger e Scalar em desenvolvimento.

---

## 6. Configuração local

### Pré-requisitos

- .NET SDK 9.
- PostgreSQL 16 ou Docker.
- Docker Compose, caso use a infraestrutura conteinerizada.
- Uma chave JWT segura.

### Restaurar e compilar

```bash
dotnet restore ProjetoIntegradorBack.Api/ProjetoIntegradorBack.Api.csproj
dotnet build ProjetoIntegradorBack.Api/ProjetoIntegradorBack.Api.csproj
```

### Configurar variáveis

Para execução local, defina as variáveis no shell ou crie um `.env` na raiz. O `.env` não deve ser versionado.

Exemplo mínimo:

```bash
export DATABASE_CONNECTION_STRING="Host=localhost;Port=5432;Database=projeto_integrador;Username=projeto_integrador;Password=projeto_integrador_dev"
export Jwt__Key="uma-chave-secreta-longa-com-pelo-menos-32-caracteres"
export Jwt__Issuer="ProjetoIntegradorBack"
export Jwt__Audience="ProjetoIntegradorBack.Client"
export Jwt__AccessTokenMinutes="30"
```

Executar:

```bash
dotnet run --project ProjetoIntegradorBack.Api/ProjetoIntegradorBack.Api.csproj
```

A porta pode variar conforme o perfil de execução. No Docker, a API fica disponível em `http://localhost:8080`.

---

## 7. Docker Compose

O `docker-compose.yml` cria dois serviços:

### PostgreSQL

- Imagem: `postgres:16-alpine`.
- Container: `projeto-integrador-back-postgres`.
- Volume persistente: `postgres_data`.
- Porta publicada: `5432`.
- Healthcheck com `pg_isready`.

### API

- Construída pelo `Dockerfile`.
- Container: `projeto-integrador-back-api`.
- Porta publicada: `8080`.
- Aguarda o PostgreSQL ficar saudável.
- Usa `http://+:8080` dentro do container.

### Execução

```bash
cp .env.example .env
# Edite .env e substitua senhas e a chave JWT
docker compose up --build
```

Validar a configuração sem iniciar containers:

```bash
docker compose --env-file .env.example config
```

Parar os serviços:

```bash
docker compose down
```

Parar e remover também o volume do banco:

```bash
docker compose down -v
```

> O comando `down -v` apaga os dados persistidos do PostgreSQL.

---

## 8. Variáveis de ambiente

O arquivo `.env.example` documenta as variáveis esperadas pelo Compose.

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `POSTGRES_DB` | Não | `projeto_integrador` | Nome do banco |
| `POSTGRES_USER` | Não | `projeto_integrador` | Usuário do PostgreSQL |
| `POSTGRES_PASSWORD` | Não | `projeto_integrador_dev` | Senha do PostgreSQL; altere em produção |
| `ASPNETCORE_ENVIRONMENT` | Não | `Development` | Ambiente ASP.NET Core |
| `ASPNETCORE_URLS` | Não | `http://+:8080` | Endereço de escuta da API no container |
| `JWT_KEY` | Sim no Compose | — | Chave usada para assinar tokens JWT |
| `JWT_ISSUER` | Não | `ProjetoIntegradorBack` | Emissor do token |
| `JWT_AUDIENCE` | Não | `ProjetoIntegradorBack.Client` | Público do token |
| `JWT_ACCESS_TOKEN_MINUTES` | Não | `30` | Duração do access token |

O Compose converte as variáveis JWT para a convenção de configuração do .NET:

```text
JWT_KEY                    → Jwt:Key
JWT_ISSUER                 → Jwt:Issuer
JWT_AUDIENCE               → Jwt:Audience
JWT_ACCESS_TOKEN_MINUTES  → Jwt:AccessTokenMinutes
```

A variável `DATABASE_CONNECTION_STRING` é montada automaticamente pelo Compose com host `postgres`, banco, usuário e senha configurados.

Nunca versione `.env`, chaves JWT reais ou senhas reais.

---

## 9. Execução e migrações

O contexto de dados está em `ProjetoIntegradorBack.Repository/Context/BookTimeDbContext.cs`. As migrations estão em `ProjetoIntegradorBack.Repository/Migrations`.

Para listar migrations:

```bash
dotnet ef migrations list \
  --project ProjetoIntegradorBack.Repository/ProjetoIntegradorBack.Infrastructure.csproj \
  --startup-project ProjetoIntegradorBack.Api/ProjetoIntegradorBack.Api.csproj
```

Para aplicar migrations, com a connection string disponível:

```bash
dotnet ef database update \
  --project ProjetoIntegradorBack.Repository/ProjetoIntegradorBack.Infrastructure.csproj \
  --startup-project ProjetoIntegradorBack.Api/ProjetoIntegradorBack.Api.csproj
```

A migration inicial existente é `InitialCreate`.

> A aplicação não executa `Database.Migrate()` automaticamente durante o startup. Em ambientes novos, aplique as migrations explicitamente antes de usar a API.

---

## 10. Autenticação e segurança

### JWT

O login valida o e-mail e a senha, gera um access token e cria um refresh token com validade de sete dias. O access token contém informações do usuário e é assinado usando `Jwt:Key`.

A validação do token verifica:

- Assinatura.
- Emissor (`Jwt:Issuer`).
- Audiência (`Jwt:Audience`).
- Expiração.
- `ClockSkew` igual a zero.

### Senhas

Os fluxos legados de criação de usuário utilizam BCrypt para armazenar a senha com hash. Senhas não devem ser persistidas em texto puro.

### Refresh token

O refresh token é persistido pela `IRefreshTokenRepository` e pode ser revogado pelo endpoint de logout.

### Recomendações para produção

- Usar uma `JWT_KEY` aleatória, longa e armazenada em secret manager.
- Definir `ASPNETCORE_ENVIRONMENT=Production`.
- Não publicar PostgreSQL diretamente na internet.
- Usar HTTPS via reverse proxy.
- Configurar CORS, rate limiting e logs sem dados sensíveis.
- Rotacionar credenciais e tokens conforme a política de segurança.

---

## 11. Mediator, CQRS e handlers

Os comandos e queries implementam contratos do pacote `Prime.Architecture.Mediator.Standard`.

Exemplo conceitual:

```csharp
public record CriarServicoCommand(...) : IRequest<ServicoDto>;

public sealed class CriarServicoHandler : IRequestHandler<CriarServicoCommand, ServicoDto>
{
    public Task<ServicoDto> Handle(CriarServicoCommand request, CancellationToken ct)
    {
        // regra de aplicação
    }
}
```

Os controllers não precisam conhecer a implementação do handler:

```csharp
return Ok(await mediator.Send(command, ct));
```

Os handlers principais estão organizados em `Api/Handlers/NavalhaCorte`. Os fluxos legados foram adaptados em `Api/Handlers/LegacyCommandHandlers.cs`, que encaminha commands antigos para os handlers existentes.

Queries implementadas incluem:

- `MeusAgendamentosQuery`.
- `AgendaMensalQuery`.
- `AgendaDiaQuery`.
- `HorariosDisponiveisQuery`.
- `ListarContatosQuery`.
- `ListarEstabelecimentosQuery`.
- `ObterEstabelecimentoQuery`.
- `ListarFuncionariosQuery`.
- `ListarServicosQuery`.
- `RelatorioComissaoQuery`.
- `RelatorioAtendimentosQuery`.

Commands principais incluem criação, atualização, cancelamento, remarcação, alteração de status e envio de contato.

---

## 12. Endpoints implementados

Todas as rotas abaixo são relativas à origem da API, por exemplo `http://localhost:8080`.

### 12.1 Autenticação — `/api/v1/auth`

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Autentica usuário por e-mail e senha. |
| `POST` | `/api/v1/auth/logout` | Revoga um refresh token. |

`login` recebe `LoginCommand`. O logout recebe o refresh token no corpo da requisição.

### 12.2 Usuários legados — `/api/user`

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/user/create-user` | Cria um usuário cliente. |
| `POST` | `/api/user/create-barbershop-owner` | Cria um usuário proprietário de estabelecimento. |

### 12.3 Estabelecimentos — `/api/v1/estabelecimentos`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/v1/estabelecimentos` | Lista estabelecimentos com busca, cidade, paginação e tamanho. |
| `GET` | `/api/v1/estabelecimentos/{id}` | Obtém um estabelecimento. |
| `POST` | `/api/v1/estabelecimentos` | Cria estabelecimento. |
| `PUT` | `/api/v1/estabelecimentos/{id}` | Atualiza estabelecimento. |
| `GET` | `/api/v1/estabelecimentos/{id}/funcionarios` | Lista funcionários do estabelecimento. |
| `GET` | `/api/v1/estabelecimentos/{id}/servicos` | Lista serviços do estabelecimento. |
| `GET` | `/api/v1/estabelecimentos/{id}/disponibilidade` | Consulta horários disponíveis. |

A disponibilidade utiliza `data`, `funcionarioId` e `servicoId` como parâmetros de query.

### 12.4 Agendamentos — `/api/v1/agendamentos`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/v1/agendamentos/meus` | Lista agendamentos de um cliente. |
| `GET` | `/api/v1/agendamentos/agenda` | Lista agenda mensal do funcionário. |
| `GET` | `/api/v1/agendamentos/agenda/{dia}` | Lista agenda de um dia. |
| `POST` | `/api/v1/agendamentos` | Cria agendamento e valida conflito de horário. |
| `PUT` | `/api/v1/agendamentos/{id}/remarcar` | Remarca agendamento. |
| `PATCH` | `/api/v1/agendamentos/{id}/cancelar` | Cancela agendamento. |

### 12.5 Contatos — `/api/v1/contato`

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/v1/contato` | Envia contato. |
| `GET` | `/api/v1/contato` | Lista contatos, opcionalmente filtrados por status. |
| `PATCH` | `/api/v1/contato/{id}/status` | Atualiza status do contato. |

### 12.6 Relatórios — `/api/v1/relatorios`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/v1/relatorios/comissoes` | Relatório de comissões por mês, ano e funcionário opcional. |
| `GET` | `/api/v1/relatorios/atendimentos` | Relatório de atendimentos em um intervalo. |

### 12.7 Fluxos legados — `/api/barbershop` e `/api/Appointment`

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/barbershop/create-barbershop` | Cria barbearia. |
| `GET` | `/api/barbershop/get-barbershops` | Lista barbearias. |
| `POST` | `/api/barbershop/create-barber` | Cria barbeiro. |
| `POST` | `/api/barbershop/create-barber-schedule` | Cria horário de barbeiro. |
| `POST` | `/api/barbershop/create-service` | Cria serviço. |
| `GET` | `/api/barbershop/get-services` | Lista serviços. |
| `GET` | `/api/barbershop/get-barbershop/{id}` | Obtém barbearia. |
| `GET` | `/api/barbershop/get-service` | Obtém serviço por `barberShopId` e `id`. |
| `GET` | `/api/Appointment/get-barbers-schedule` | Consulta horários disponíveis. |
| `POST` | `/api/Appointment/create-appointment` | Cria agendamento legado. |
| `GET` | `/api/Appointment/get-appointments-barber` | Lista agendamentos de barbeiro. |

Os endpoints legados existem por compatibilidade e devem ser gradualmente substituídos pelos endpoints versionados.

---

## 13. Persistência e repositórios

As interfaces de domínio são implementadas no projeto `ProjetoIntegradorBack.Repository`.

Repositórios existentes:

- `UserRepository`.
- `RefreshTokenRepository`.
- `BarberShopRepository`.
- `AppointmentRepository`.
- `EstabelecimentoRepository`.
- `FuncionarioRepository`.
- `ServicoRepository`.
- `AgendamentoRepository`.
- `ContatoRepository`.
- `RelatorioRepository`.

Os repositórios são registrados como `Scoped` no container de injeção de dependência.

Os fluxos novos usam entidades como `Estabelecimento`, `Funcionario`, `Servico`, `Agendamento` e `Contato`. Os fluxos legados mantêm entidades como `BarberShop`, `Barber`, `BarberShopService` e `Appointment`.

---

## 14. DTOs e contratos de retorno

Os endpoints retornam DTOs em vez de expor diretamente as entidades de domínio. O mapeamento é configurado em `Api/Mappings/NavalhaCorteMappingProfile.cs` usando `Prime.Architecture.Mapper.Configuration.MappingProfile`, registrado no `Program.cs` como singleton através de `IMapper`.

Mapeamentos configurados:

```text
Endereco              → EnderecoDto
EnderecoDto           → Endereco
Estabelecimento       → EstabelecimentoDto
Estabelecimento       → EstabelecimentoDetalheDto
Funcionario           → FuncionarioDto
Servico               → ServicoDto
Agendamento           → AgendamentoDto
Contato               → ContatoDto
ClientUser            → UsuarioDto
BarberShop            → BarberShopDto
BarberShopService     → BarberShopServiceDto
Appointment           → AppointmentDto
```

### DTOs de autenticação e usuário

#### `AuthResponseDto`

| Propriedade | Tipo | Descrição |
|---|---|---|
| `AccessToken` | `string` | Token JWT de acesso. |
| `RefreshToken` | `string` | Token usado para renovação/revogação. |
| `Usuario` | `UsuarioDto` | Dados públicos do usuário autenticado. |

#### `UsuarioDto`

| Propriedade | Tipo |
|---|---|
| `Id` | `Guid` |
| `Nome` | `string` |
| `Email` | `string` |
| `Telefone` | `string?` |
| `Tipo` | `UserType` |
| `ProfilePictureUrl` | `string` |

### DTOs de estabelecimento, funcionário e serviço

#### `EstabelecimentoDto`

| Propriedade | Tipo |
|---|---|
| `Id` | `Guid` |
| `RazaoSocial` | `string` |
| `NomeFantasia` | `string` |
| `Telefone` | `string` |
| `Email` | `string` |
| `Descricao` | `string` |
| `HorarioFuncionamento` | `string` |
| `Ativo` | `bool` |
| `Endereco` | `EnderecoDto` |
| `CriadoEm` | `DateTime` |

`EstabelecimentoDetalheDto` herda todas as propriedades de `EstabelecimentoDto` e acrescenta:

| Propriedade | Tipo |
|---|---|
| `Servicos` | `List<ServicoDto>` |
| `Funcionarios` | `List<FuncionarioDto>` |

#### `FuncionarioDto`

| Propriedade | Tipo |
|---|---|
| `Id` | `Guid` |
| `EstabelecimentoId` | `Guid` |
| `UsuarioId` | `Guid` |
| `Nome` | `string` |
| `Email` | `string` |
| `Telefone` | `string` |
| `Funcao` | `string` |
| `PercentualComissao` | `decimal` |
| `Ativo` | `bool` |
| `CriadoEm` | `DateTime` |

#### `ServicoDto`

| Propriedade | Tipo |
|---|---|
| `Id` | `Guid` |
| `EstabelecimentoId` | `Guid` |
| `Nome` | `string` |
| `Descricao` | `string?` |
| `DuracaoMinutos` | `int` |
| `Preco` | `decimal` |
| `Ativo` | `bool` |

#### `EnderecoDto`

| Propriedade | Tipo |
|---|---|
| `Rua` | `string` |
| `Numero` | `string` |
| `Complemento` | `string?` |
| `Bairro` | `string` |
| `Cidade` | `string` |
| `Estado` | `string` |
| `Latitude` | `decimal?` |
| `Longitude` | `decimal?` |
| `Cep` | `string` |

### DTOs de agendamento e disponibilidade

#### `AgendamentoDto`

| Propriedade | Tipo |
|---|---|
| `Id` | `Guid` |
| `ClienteId` | `Guid` |
| `EstabelecimentoId` | `Guid` |
| `NomeEstabelecimento` | `string` |
| `FuncionarioId` | `Guid` |
| `NomeFuncionario` | `string` |
| `ServicoId` | `Guid` |
| `NomeServico` | `string` |
| `DataHora` | `DateTime` |
| `Status` | `StatusAgendamento` |
| `Observacoes` | `string?` |
| `ValorTotal` | `decimal` |
| `NumeroReserva` | `string?` |
| `CriadoEm` | `DateTime` |

#### `AgendamentoDiaDto`

Representa um agrupamento da agenda mensal:

| Propriedade | Tipo |
|---|---|
| `Dia` | `DateOnly` |
| `TotalAgendamentos` | `int` |
| `Agendamentos` | `List<AgendamentoDto>` |

#### `HorarioDisponivelDto`

| Propriedade | Tipo |
|---|---|
| `Horario` | `TimeOnly` |
| `Disponivel` | `bool` |

#### `PagedResultDto<T>`

Usado em listagens paginadas:

| Propriedade | Tipo |
|---|---|
| `Dados` | `List<T>` |
| `Pagina` | `int` |
| `TamanhoPagina` | `int` |
| `Total` | `int` |

### DTOs de contato e relatórios

#### `ContatoDto`

| Propriedade | Tipo |
|---|---|
| `Id` | `Guid` |
| `Assunto` | `string` |
| `Nome` | `string` |
| `Sobrenome` | `string` |
| `Email` | `string` |
| `NumeroReserva` | `string?` |
| `Descricao` | `string` |
| `Status` | `StatusContato` |
| `CriadoEm` | `DateTime` |

#### `RelatorioComissaoDto`

| Propriedade | Tipo |
|---|---|
| `Mes` | `int` |
| `Ano` | `int` |
| `Comissoes` | `List<ComissaoFuncionarioInfo>` |
| `TotalFaturamento` | `decimal` |
| `TotalComissoes` | `decimal` |

#### `RelatorioAtendimentosDto`

| Propriedade | Tipo |
|---|---|
| `Inicio` | `DateTime` |
| `Fim` | `DateTime` |
| `Resumo` | `ResumoAtendimentosInfo` |

`ComissaoFuncionarioInfo` e `ResumoAtendimentosInfo` são modelos de relatório em `Domain/Models` e representam os valores agregados retornados pelo repositório.

### DTOs dos endpoints legados

Para evitar que os endpoints legados exponham entidades diretamente, foram adicionados:

#### `BarberShopDto`

| Propriedade | Tipo |
|---|---|
| `Id` | `Guid` |
| `Name` | `string` |
| `Description` | `string` |
| `Phone` | `string` |
| `Email` | `string` |
| `Logo` | `string` |

#### `BarberShopServiceDto`

| Propriedade | Tipo |
|---|---|
| `Id` | `Guid` |
| `Name` | `string` |
| `Price` | `decimal` |
| `DurationInMinutes` | `int` |

#### `AppointmentDto`

| Propriedade | Tipo |
|---|---|
| `Id` | `Guid` |
| `BarberId` | `Guid` |
| `ServiceId` | `Guid` |
| `CustomerName` | `string` |
| `StartDateTime` | `DateTime` |
| `EndDateTime` | `DateTime` |
| `Status` | `AppointmentStatus` |

Os endpoints legados de consulta agora usam `IMapper` e os mapeamentos acima antes de serializar a resposta.

## 15. Modelo de domínio

Principais entidades encontradas no domínio:

| Entidade | Responsabilidade |
|---|---|
| `ClientUser` / `User` | Dados e perfil de usuário. |
| `RefreshToken` | Token de renovação e revogação. |
| `Estabelecimento` / `BarberShop` | Dados do estabelecimento. |
| `Funcionario` / `Barber` | Profissional vinculado ao estabelecimento. |
| `Servico` / `BarberShopService` | Serviço oferecido e preço/duração. |
| `Agendamento` / `Appointment` | Reserva de horário. |
| `Contato` | Solicitação enviada pelo formulário de contato. |
| `BarberSchedule` | Horários de trabalho do profissional. |
| `BusinessHours` | Horário de funcionamento do estabelecimento. |
| `ScheduleBlock` | Bloqueios de agenda. |
| `Plan` / `Subscription` | Estruturas de plano e assinatura. |

Enums de domínio incluem status de agendamento e status de contato. DTOs são utilizados para evitar expor diretamente todas as entidades nas respostas HTTP.

---

## 16. Documentação da API

Em ambiente de desenvolvimento, a aplicação registra Swagger e Scalar.

Com a API em execução localmente, os endereços esperados são:

```text
Swagger JSON: http://localhost:8080/swagger/v1/swagger.json
Scalar:       http://localhost:8080/scalar
```

A aplicação também possui uma rota raiz que redireciona para `/scalar`.

Para testar endpoints autenticados:

1. Execute o login.
2. Copie o access token retornado.
3. Envie o header:

```http
Authorization: Bearer <access-token>
```

---

## 17. Limitações e próximos passos

### Segurança e operação

- Configurar CORS com origens permitidas.
- Adicionar rate limiting para login e endpoints sensíveis.
- Configurar HTTPS no ambiente de produção.
- Remover credenciais padrão do ambiente de desenvolvimento.
- Adicionar tratamento global padronizado de exceções.
- Evitar exposição de mensagens internas em respostas de erro.

### Qualidade

- Criar testes unitários para handlers, serviços e entidades.
- Criar testes de integração para controllers e repositórios.
- Adicionar validação consistente para todos os commands legados.
- Padronizar os endpoints legados com a API `/api/v1`.
- Habilitar nullable reference types gradualmente e eliminar os avisos existentes.

### Produto

- Implementar recuperação de senha.
- Integrar notificações por e-mail e WhatsApp.
- Implementar refresh token rotation.
- Adicionar paginação e filtros aos endpoints legados.
- Implementar cálculo e fechamento de comissões conforme regra de negócio.
- Adicionar observabilidade, métricas e tracing.
- Automatizar migrations e deploy por pipeline CI/CD.

---

## Referências rápidas

```bash
# Restaurar
dotnet restore

# Compilar
dotnet build ProjetoIntegradorBack.Api/ProjetoIntegradorBack.Api.csproj

# Executar
dotnet run --project ProjetoIntegradorBack.Api/ProjetoIntegradorBack.Api.csproj

# Validar Compose
docker compose --env-file .env.example config

# Subir infraestrutura
docker compose up --build

# Derrubar containers
docker compose down
```
