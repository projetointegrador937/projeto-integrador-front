import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../api';
import { authService } from '../auth.services';

vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
  },
}));

const postMock = vi.mocked(api.post);

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('faz login com e-mail e senha', async () => {
    const payload = { email: 'cliente@exemplo.com', password: 'senha-segura' };
    const response = { data: { accessToken: 'access-token', refreshToken: 'refresh-token', usuario: { id: '1' } } };
    postMock.mockResolvedValueOnce(response);

    await expect(authService.login(payload)).resolves.toEqual(response);
    expect(postMock).toHaveBeenCalledWith('/api/v1/auth/login', payload);
  });

  it('envia o refresh token para logout', async () => {
    const payload = { refreshToken: 'refresh-token' };
    postMock.mockResolvedValueOnce({ data: undefined });

    await authService.logout(payload);

    expect(postMock).toHaveBeenCalledWith('/api/v1/auth/logout', payload);
  });

  it('cria usuário cliente', async () => {
    const payload = { name: 'Cliente', email: 'cliente@exemplo.com', password: 'senha-segura' };
    postMock.mockResolvedValueOnce({ data: { id: '1' } });

    await authService.createUser(payload);

    expect(postMock).toHaveBeenCalledWith('/api/v1/users/create', payload);
  });


  it('propaga erros retornados pela API', async () => {
    const error = new Error('Credenciais inválidas');
    postMock.mockRejectedValueOnce(error);

    await expect(authService.login({ email: 'cliente@exemplo.com', password: 'errada' })).rejects.toBe(error);
  });
});
