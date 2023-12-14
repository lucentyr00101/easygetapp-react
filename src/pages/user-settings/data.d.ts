export type UserSettingsTableListItem = {
  id?: string;
  key: number;
  username: string;
  createdTime: string;
  createdBy: string;
  status: string;
  password?: string;
  remarks?: string;
  ipWhitelist?: string;
  gaStatus?: string;
  roles?: any[];
};

export type SelectedUserNameGeneralPermissionItem = {
  username: string;
  generalPermissions?: string[];
  generalPermissionsChecks?: string[];
};
