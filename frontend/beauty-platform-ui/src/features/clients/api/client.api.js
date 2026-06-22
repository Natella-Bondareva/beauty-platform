import { api } from '../../../shared/api/client';

export const clientApi = {
  // Пошук клієнтів за номером телефону (для адмін-запису)
  search: (salonId, phone) =>
    api.get(`/salons/${salonId}/clients`, { params: { phone } }),
};
