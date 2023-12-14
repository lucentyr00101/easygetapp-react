import { TablePaginationConfig } from "antd/es/table";

export const paginationProps: TablePaginationConfig = {
    size: 'default',
    defaultPageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true
}

export type Pagination = {
    total: number;
    pageSize: number;
    current: number;
};