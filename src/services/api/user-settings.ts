import { request } from '@umijs/max';

export async function fetchSysUserSearch(
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
  return request<API.APIResult>('sysUser/search', {
    baseURL: PITBULL_API_URL,
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}

export async function updateSysUserStatus(params: API.UpdateStatusParms) {
  return request<API.APIResult>('sysUser/status', {
    baseURL: PITBULL_API_URL,
    method: 'PUT',
    data: params,
  });
}

export async function sysUserAdd(params: any, options?: Record<string, any>) {
  return request<API.APIResult>('sysUser/add', {
    baseURL: PITBULL_API_URL,
    method: 'POST',
    data: params,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function sysUserUpdate(params: any, options?: Record<string, any>) {
  return request<API.APIResult>('sysUser/update', {
    baseURL: PITBULL_API_URL,
    method: 'PUT',
    data: params,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function sysUserGeneralPermission(
  params: {
    username: string;
    sysPermissions?: string[];
    sysPermissionChecks?: string[];
  },
  options?: Record<string, any>,
) {
  return request<API.APIResult>('sysUser/generalPermission', {
    method: 'PUT',
    data: params,
    ...(options || {}),
  });
}

export async function resetGACode(
  params: {
    username: string;
    code: string;
    language?: string;
  },
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
