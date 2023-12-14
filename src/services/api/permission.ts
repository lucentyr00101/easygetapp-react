import { request } from '@umijs/max';

export async function getSysPermissionTree(params?: { permissionGroupType: string }) {
  return request('sysPermission/tree', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}
