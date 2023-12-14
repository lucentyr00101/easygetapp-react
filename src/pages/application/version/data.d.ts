export type VersionTableListItem = {
  id: string;
  key: number;
  versionNumber: string;
  buildNumber: string;
  size?: string;
  downloads: number;
  createdTime: string;
  versionStatus: string;
  description: string;
  superDistributionLink?: string;
  forceUpdate: string;
  appFile: any;
  latestVersion: string;
};
