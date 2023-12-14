import { request } from '@umijs/max';

export async function getDropdownStatusType() {
  return request<API.APIDropdownResult>('dropdown/statusType', {
    skipErrorHandler: true,
    method: 'GET',
  });
}

export async function getDropdownUserType() {
  return request<API.APIDropdownResult>('dropdown/userType', {
    skipErrorHandler: true,
    method: 'GET',
  });
}

export async function getDropdownRoles() {
  return request<API.APIDropdownResult>('dropdown/role', {
    skipErrorHandler: true,
    baseURL: PITBULL_API_URL,
    method: 'GET',
  });
}

export async function getDropdownActiveRoles() {
  return request<API.APIDropdownResult>('dropdown/role/active', {
    skipErrorHandler: true,
    baseURL: PITBULL_API_URL,
    method: 'GET',
    params: {
      applicationId: APP_ID,
    },
  });
}

export async function getMarketingApps(params?: { id: string }) {
  return request<API.APIDropdownResult>('dropdown/marketApps', {
    skipErrorHandler: true,
    method: 'GET',
    params,
  });
}

export async function getActiveRoles(params?: { roleId: string }) {
  return request<API.APIDropdownResult>('dropdown/role/active', {
    skipErrorHandler: true,
    baseURL: PITBULL_API_URL,
    method: 'GET',
    params,
  });
}

export async function marketTypes(params?: any) {
  return request<API.APIDropdownResult>('dropdown/marketTypes', {
    skipErrorHandler: true,
    method: 'GET',
    params,
  });
}
