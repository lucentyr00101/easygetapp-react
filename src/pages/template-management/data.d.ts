export type TemplateManagementTableListItem =
  | {
      id?: string;
      key?: number;
      username?: string;
      userType?: string;
      createdTime?: string;
      createdBy?: string;
      status?: string;
      password?: string;
      remarks?: string;
      ipWhitelist?: string;
    }
  | any;
