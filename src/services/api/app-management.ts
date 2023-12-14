import { request } from '@umijs/max';

export async function fetchApps(
  params: {
    size: number;
    page: number;
    sort?: string;
    language?: string;
    name?: string;
    appId?: string;
    version?: string;
    fromDate?: string;
    toDate?: string;
  },
  options?: Record<string, any>,
) {
  return request<API.APIResult>('app/search', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}

export async function getAppTemplateLink(params: any) {
  return request<{
    data: any;
  }>('app/public/installation-page', {
    method: 'GET',
    params,
  });
}

/** 获取当前订阅 GET /api/subscription/current */
export async function getAppSubscription(options?: { [key: string]: any }) {
  return request<{
    data: API.AppSubscription;
  }>('/subscription/current', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getFileDetails(params: FormData, options?: Record<string, any>) {
  return request<any>('app/getFileDetails', {
    method: 'POST',
    data: params,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function uploadApp(params: any, options?: Record<string, any>) {
  // for (let key of params) { console.log(key); } // Check Form Data Properties
  return request<any>('app/upload', {
    method: 'POST',
    data: params,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function getCurrentAppDetails(id: string) {
  return request('app/detail', {
    method: 'GET',
    params: {
      id,
    },
    skipErrorHandler: true,
  });
}

export async function getPublicAppDetails(
  id: string,
  version: string,
  pitbullRegistrationId?: string,
) {
  return request('app/public/detail', {
    method: 'GET',
    params: {
      installationPage: id,
      versionId: version,
      pitbullRegistrationId,
    },
    skipErrorHandler: true,
  });
}

export async function updateApp(params: any, options?: Record<string, any>) {
  return request('app/update', {
    method: 'PUT',
    data: params,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function verifyDownload(data: { id: string; password?: string; code?: string }) {
  return request('appVersion/validateDownload', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}

export async function publicVerifyDownload(data: { id: string; password?: string; code?: string }) {
  return request('appVersion/public/validateDownload', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}

export async function updateNotesInstructions(data: {
  id: string;
  instructions: string;
  releaseNotes: string;
}) {
  return request('app/instructions', {
    method: 'PUT',
    data,
    skipErrorHandler: true,
  });
}

export async function getCodes(data: { id: string }) {
  return request('appInstallationCode/getCodes', {
    method: 'GET',
    params: data,
    skipErrorHandler: true,
  });
}

export async function generateCodes(data: { appId: string; noOfCodes: number }) {
  return request('appInstallationCode/generateCode', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}

export async function deleteCodes(data: { entityIds: string[] }) {
  return request('appInstallationCode/delete', {
    method: 'DELETE',
    data,
    skipErrorHandler: true,
  });
}

export async function exportCodes(data: { appId: string; language?: string }) {
  return request('appInstallationCode/export', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}

export async function deleteApp(data: { entityIds: string[] }) {
  return request('app/delete', {
    method: 'DELETE',
    data,
    skipErrorHandler: true,
  });
}

export async function appVersionSearch(params: any, options?: Record<string, any>) {
  return request<any>('appVersion/search', {
    method: 'POST',
    data: params,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function addVersion(data: any, options?: Record<string, any>) {
  return request<any>('appVersion/upload', {
    method: 'POST',
    data,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function updateVersion(data: any, options?: Record<string, any>) {
  return request<any>('appVersion/update', {
    method: 'PUT',
    data,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function deleteVersion(data: { entityIds: string[] }, options?: Record<string, any>) {
  return request<any>('appVersion/delete', {
    method: 'DELETE',
    data,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function archiveVersion(data: { id: string }, options?: Record<string, any>) {
  return request<any>('appVersion/archive', {
    method: 'PUT',
    data,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function dropdownAppVersions(data: { id: string }) {
  return request('dropdown/appVersions', {
    method: 'GET',
    params: data,
    skipErrorHandler: true,
  });
}

export async function appDownloadHistoryStatisticsTopTen(data: any, options?: Record<string, any>) {
  return request<any>('appDownloadHistory/statistics/topTen', {
    method: 'POST',
    data,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function appDownloadHistoryStatistics(data: any, options?: Record<string, any>) {
  return request<any>('appDownloadHistory/statistics', {
    method: 'POST',
    data,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function updateIcon(params: any, options?: Record<string, any>) {
  return request<any>('app/updateIcon', {
    method: 'PUT',
    data: params,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function appAttributeSearch(params: any, options?: Record<string, any>) {
  return request<any>('attribute/search', {
    method: 'POST',
    data: params,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function addAttributes(data: any, options?: Record<string, any>) {
  return request<any>('attribute/add', {
    method: 'POST',
    data,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function updateAttributes(data: any, options?: Record<string, any>) {
  return request<any>('attribute/update', {
    method: 'PUT',
    data,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function deleteAttributes(
  data: { entityIds: string[] },
  options?: Record<string, any>,
) {
  return request<any>('attribute/delete', {
    method: 'DELETE',
    data,
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function getAppPreview(data: { id: string }) {
  return request<API.APIResult>(`app/preview`, {
    method: 'GET',
    params: {
      id: data,
    },
    skipErrorHandler: true,
  });
}

export async function deployApp(data: { id: string }) {
  return request<any>('app/deploy', {
    method: 'POST',
    params: {
      id: data,
    },
    skipErrorHandler: true,
  });
}
