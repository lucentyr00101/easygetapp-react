declare namespace API {
  type APIResult = {
    success?: string;
    message?: string;
    code?: number;
    data?: {
      success?: string;
      message?: string;
      code?: number;
      data: Array;
      totalElements?: number;
      totalPages?: number;
    };
    totalElements?: number;
    totalPages?: number;
  };

  type APIDropdownResult = {
    success?: string;
    message?: string;
    code?: number;
    data?: Array;
  };

  type UpdateStatusParms = {
    id: string;
    status: string;
  };
}
