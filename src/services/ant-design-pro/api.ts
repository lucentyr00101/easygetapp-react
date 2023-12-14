// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 登录接口 POST auth/verify */
export async function verifyCode(data: any) {
  return request<any>('auth/verify', {
    baseURL: PITBULL_API_URL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('t') as string}`,
      'Content-Type': 'application/json',
    },
    data,
    skipErrorHandler: true,
  });
}

export async function refreshToken(refreshToken: string) {
  return request('auth/refreshToken', {
    baseURL: PITBULL_API_URL,
    method: 'POST',
    data: { refreshToken },
    skipErrorHandler: true,
  });
}

/** PUT /api/auth/qrImage */
export async function fetchQr(data: { username: string }, options?: { [key: string]: any }) {
  return request<any>('/auth/qrImage', {
    baseURL: PITBULL_API_URL,
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('t') as string}`,
    },
    data,
    ...(options || {}),
  });
}

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/auth/me', {
    baseURL: PITBULL_API_URL,
    method: 'GET',
    skipErrorHandler: true,
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    baseURL: PITBULL_API_URL,
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<any>('/auth/login', {
    baseURL: PITBULL_API_URL,
    skipErrorHandler: true,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function fetchTimezones(
  data: {
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
    sort?: string;
    language?: string;
    name?: string;
  },
  options?: any,
) {
  return request<any>('sysTimezone/search', {
    baseURL: PITBULL_API_URL,
    skipErrorHandler: true,
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function updateTimezone(
  data: {
    id: string;
    sysTimezoneId: string;
  },
  options?: any,
) {
  return request<any>('sysUser/timezone', {
    baseURL: PITBULL_API_URL,
    skipErrorHandler: true,
    method: 'PUT',
    data,
    ...(options || {}),
  });
}

export async function logout(
  data: {
    username: string;
  },
  options?: any,
) {
  return request<any>('auth/logout', {
    baseURL: PITBULL_API_URL,
    skipErrorHandler: true,
    method: 'POST',
    data,
    ...(options || {}),
  });
}
