import { request } from '@umijs/max';

export async function fetchAppTemplates(params: any) {
  return request('dropdown/template', {
    method: 'GET',
    params,
  });
}

export async function fetchFields(params: any) {
  return request('templateConfiguration/all', {
    method: 'GET',
    params,
  });
}

export async function updateTemplate(data: any) {
  return request('templateConfiguration/update', {
    method: 'PUT',
    data,
  });
}
