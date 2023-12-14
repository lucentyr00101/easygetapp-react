import { request } from '@umijs/max';

export async function fetchUserDetail(
  params: {
    username: string;
  },
  options?: Record<string, any>,
) {
  return request<any>('sysUser/detail', {
    baseURL: PITBULL_API_URL,
    method: 'GET',
    params,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function updatePassword(
  params: {
    username: string;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  },
  options?: Record<string, any>,
) {
  return request<any>('sysUser/resetPassword', {
    baseURL: PITBULL_API_URL,
    method: 'PUT',
    data: params,
    skipErrorHandler: true,
    ...(options || {}),
  });
}
