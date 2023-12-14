import { request } from '@umijs/max';

export async function fetchSysTemplateSearch(
  params: {
    size: number;
    page: number;
    sort?: string;
    fromDate?: string;
    toDate?: string;
    language?: string;
    username?: string;
    status?: string;
    userType?: string;
  },
  options?: Record<string, any>,
) {
  return request<API.APIResult>('template/search', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}

export async function templateAdd(data: any) {
  return request<API.APIResult>('template/add', {
    method: 'POST',
    data: data,
    skipErrorHandler: true,
  });
}

export async function templateUpdate(data: any) {
  return request<API.APIResult>('template/update', {
    method: 'PUT',
    data: data,
    skipErrorHandler: true,
  });
}

export async function templatePreview(data: { id: string }, options?: Record<string, any>) {
  return request<API.APIResult>(`template/preview/${data?.id}`, {
    method: 'GET',
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function templateDownload(data: { id: string }, options?: Record<string, any>) {
  return request<API.APIResult>(`template/download/${data?.id}`, {
    method: 'POST',
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function templateDelete(data: { id: string }, options?: Record<string, any>) {
  return request<API.APIResult>(`template/delete/${data?.id}`, {
    method: 'DELETE',
    skipErrorHandler: true,
    ...(options || {}),
  });
}
