import { request } from '@umijs/max';

export async function getAuthMe() {
  return request('auth/me', {
    method: 'GET',
  });
}
