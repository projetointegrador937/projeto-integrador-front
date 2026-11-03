import api from './api';
import type { Contact, ContactRequest, ContactStatusRequest } from '../interfaces/api';

const base = '/api/v1/contact';
export const contactService = {
  send: (payload: ContactRequest) => api.post<Contact>(base, payload),
  list: (status?: string) => api.get<Contact[]>(base, { params: status ? { status } : undefined }),
  updateStatus: (id: string, payload: ContactStatusRequest) => api.patch<Contact>(`${base}/${id}/status`, payload),
};
