import { request } from '@umijs/max';

export async function addMarket(data: any) {
  return request('market/add', {
    method: 'POST',
    skipErrorHandler: true,
    data,
  });
}

export async function updateMarket(data: any) {
  return request('market/update', {
    method: 'PUT',
    skipErrorHandler: true,
    data,
  });
}

export async function deleteMarket(data: { entityIds: string[] }) {
  return request('market/delete', {
    method: 'DELETE',
    data,
    skipErrorHandler: true,
  });
}

export async function listMarket(data: {
  marketName?: string;
  appName?: string;
  status?: 'Enable' | 'Disable';
  page: number;
  size: number;
}) {
  return request('market/search', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}
