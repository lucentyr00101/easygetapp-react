export type CodeInstallationListItem = {
  key: string;
  code: string;
  status: string;
  createdTime: string;
  id: string;
};

export type TableListItem = {
  versionStatus: string;
  key: number;
  version: string;
  build: string;
  size: string;
  downloads: number;
  updatedTime: string;
  status: string;
};

export type AppDetailItem = {
  isDeployed: boolean;
  downloadLinkQrCode: any;
  name: string;
  id?: string;
  instructions?: string;
  releaseNotes?: string;
  appId?: string;
  installationPage?: string;
  installationPageFullLink?: string;
  language?: string;
  showcaseQrCode?: string;
  downloadAvailabilityStatus?: string;
  installationMethod?: string;
  expiryDate?: string;
  validityPeriod?: string;
  platform?: string;
  downloadStartTime?: string;
  downloadEndTime?: string;
  password?: string;
  currentAndroidVersion?: {
    qrCode?: {
      fileLink?: string;
    };
  };
  currentIOSVersion?: {
    qrCode?: {
      fileLink?: string;
    };
  };
  attachments?: Array;
  isDeployed: boolean;
};
