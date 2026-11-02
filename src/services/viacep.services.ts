import type { EnderecoUsuarioPayload } from '../interfaces/api';

interface ViaCepResponse {
  erro?: boolean;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  complemento?: string;
}

export const viaCepService = {
  async findByCep(cep: string): Promise<Partial<EnderecoUsuarioPayload>> {
    const normalizedCep = cep.replace(/\D/g, '');
    if (normalizedCep.length !== 8) {
      throw new Error('CEP inválido');
    }

    const response = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`);
    if (!response.ok) throw new Error('Falha ao consultar o CEP');

    const data = await response.json() as ViaCepResponse;
    if (data.erro) throw new Error('CEP não encontrado');

    return {
      rua: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf,
      ...(data.complemento ? { complemento: data.complemento } : {}),
    };
  },
};
