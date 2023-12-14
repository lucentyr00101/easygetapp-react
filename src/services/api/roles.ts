import { request } from '@umijs/max';

export async function fetchSysRoleSearch(
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
  return request<API.APIResult>('sysRole/search', {
    baseURL: PITBULL_API_URL,
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}

export async function fetchRoleConfigList(
  params: {
    applicationId: string;
  },
  options?: Record<string, any>,
) {
  return request<any>('sysResource/tree/active', {
    baseURL: PITBULL_API_URL,
    method: 'GET',
    params,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function updateSysRoleStatus(params: API.UpdateStatusParms) {
  return request<API.APIResult>('sysRole/status', {
    baseURL: PITBULL_API_URL,
    method: 'PUT',
    data: params,
  });
}

export async function sysRoleAdd(
  params: { applicationId: string; name: string; status: string; remarks?: string },
  options?: Record<string, any>,
) {
  return request<API.APIResult>('sysRole/add', {
    baseURL: PITBULL_API_URL,
    method: 'POST',
    data: params,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function sysRoleUpdate(
  params: { id: string; applicationId: string; name: string; status: string; remarks?: string },
  options?: Record<string, any>,
) {
  return request<API.APIResult>('sysRole/update', {
    baseURL: PITBULL_API_URL,
    method: 'PUT',
    data: params,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function sysRoleGeneralPermission(
  params: { id: string; sysResourceIds?: string[]; sysResourceHalfCheckIds?: string[] },
  options?: Record<string, any>,
) {
  return request<API.APIResult>('sysRole/update/permissionConfig', {
    baseURL: PITBULL_API_URL,
    method: 'PUT',
    data: params,
    ...(options || {}),
  });
}

export async function resetGACode(
  params: { name: string; code: string; language?: string },
  options?: Record<string, any>,
) {
  return request<API.APIResult>('auth/resetOtp', {
    baseURL: PITBULL_API_URL,
    method: 'PUT',
    data: params,
    skipErrorHandler: true,
    ...(options || {}),
  });
}
