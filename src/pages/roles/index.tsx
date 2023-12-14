import { DropdownContext } from '@/contexts/dropdown.context';
import { fetchSysRoleSearch } from '@/services/api/roles';
import { PlusCircleOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { useAccess, useIntl, useModel } from '@umijs/max';
import { Button, Divider, Space, Typography } from 'antd';
import { useContext, useRef, useState } from 'react';
import { STATUS_CODE } from '../utils/dictionary.enum';
// import { STATUS_CODE } from '../utils/dictionary.enum';
import { Pagination, paginationProps } from '../utils/utils';
import AddEditRoleModal from './AddEditRoleModal';
import ConfigAccessModal from './ConfigAccessModal';
import { RoleSettingsTableListItem } from './data';

import { useGlobalContext } from '@/contexts/global.context';

const Role: React.FC = () => {
  const { appMessage } = useGlobalContext();
  const intl = useIntl();
  const access: any = useAccess();
  const tableRef = useRef<ActionType>();
  const { statusType, userType } = useContext(DropdownContext);
  const { refresh } = useModel('@@initialState');

  const [currentRow, setCurrentRow] = useState<RoleSettingsTableListItem>();
  const [addEditRoleModalVisible, setAddEditRoleModalVisible] = useState<boolean>(false);
  const [configAccessModalVisible, setConfigAccessModalVisible] = useState<boolean>(false);

  const statusTypeEnum = statusType.reduce(
    (prev: any, curr: any) => ({
      ...prev,
      [curr]: {
        text: intl.formatMessage({ id: `dropdown.select.${curr.toLowerCase()}` }),
      },
    }),
    {
      All: {
        text: intl.formatMessage({ id: 'dropdown.select.all' }),
      },
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const userTypeEnum = userType.reduce(
    (prev: any, curr: any) => ({
      ...prev,
      [curr]: {
        text: intl.formatMessage({ id: `dropdown.select.${curr.toLowerCase()}` }),
      },
    }),
    {
      All: {
        text: intl.formatMessage({ id: 'dropdown.select.all' }),
      },
    },
  );

  const handleFetchSysUserList = async (values: any): Promise<any> => {
    // console.log(values);
    const { pageSize: size, current: page, name, status } = values;
    const filter: any = { size, page: page - 1, name, status };
    try {
      const { data, totalPages, totalElements } = await fetchSysRoleSearch(filter);
      return Promise.resolve({ data: data, success: true, totalPages, total: totalElements });
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
      return {};
    }
  };

  // const handleUpdateStatus = async (values: any, checked: boolean) => {
  //   try {
  //     await updateSysRoleStatus({
  //       id: values.id,
  //       status: checked ? STATUS_CODE.ENABLE : STATUS_CODE.DISABLE
  //     });
  //     showNotification({
  //       message: intl.formatMessage({ id: 'notification.user.updated' }),
  //       type: 'success'
  //     });
  //     tableRef?.current?.reloadAndRest?.();
  //   } catch (e: any) {
  //     showNotification({
  //       message: e?.response?.data?.message || intl.formatMessage({ id: 'something-went-wrong' }),
  //       type: 'error'
  //     });
  //   }
  // };

  const columns: ProColumns<RoleSettingsTableListItem>[] = [
    {
      title: intl.formatMessage({ id: 'pages.userSetting.roles' }),
      dataIndex: 'name',
    },
    {
      title: intl.formatMessage({ id: 'pages.userSetting.createdBy' }),
      dataIndex: 'createdBy',
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.common.status' }),
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: statusTypeEnum,
      initialValue: 'All',
      render: (text, entity) => (
        <span style={{ color: entity.status === STATUS_CODE.ENABLE ? '#2FD349' : '#FF0000' }}>
          {text}
        </span>
      ),
      // render: (_, value) => (<Switch checked={value.status === STATUS_CODE.ENABLE} onChange={(checked) => { handleUpdateStatus(value, checked); }}/>)
    },
    {
      title: intl.formatMessage({ id: 'pages.common.createdTime' }),
      dataIndex: 'createdTime',
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.common.action' }),
      key: 'option',
      valueType: 'option',
      render: (value, entity: any) => {
        // const generalPermissions = entity.generalPermissions;
        // const generalPermissionsChecks = entity.generalPermissionsChecks;
        return (
          <Space split={<Divider type="vertical" />}>
            {/* <Access
              accessible={!!access?.Roles?.children?.Edit?.access}
              fallback={
                <Typography.Link
                  disabled
                  onClick={() => {
                    setCurrentRow(entity);
                    setAddEditRoleModalVisible(true);
                  }}
                >
                  {intl.formatMessage({
                    id: 'button.edit',
                  })}
                </Typography.Link>
              }
            > */}
            <Typography.Link
              onClick={() => {
                if (!!access?.Roles?.children?.Edit?.access) {
                  setCurrentRow(entity);
                  setAddEditRoleModalVisible(true);
                }
              }}
              disabled={!access?.Roles?.children?.Edit?.access}
            >
              {intl.formatMessage({ id: 'button.edit' })}
            </Typography.Link>
            {/* </Access> */}
            {/* <Access
              key="resetGACode"
              accessible={!!access?.Roles?.children?.ResetGACode?.access}
              fallback={
                <Typography.Link
                  disabled
                  onClick={() => {
                    setCurrentRow(entity);
                    setEditGACodeModalVisible(true);
                  }}
                >
                  {intl.formatMessage({
                    id: 'button.config-access',
                  })}
                </Typography.Link>
              }
            > */}
            <Typography.Link
              onClick={() => {
                if (!!access?.Roles?.children?.ConfigAccess?.access) {
                  setCurrentRow(entity);
                  setConfigAccessModalVisible(true);
                }
              }}
              disabled={!access?.Roles?.children?.ConfigAccess?.access}
            >
              {intl.formatMessage({ id: 'button.config-access' })}
            </Typography.Link>
            {/* </Access> */}
            {/* <Access
              key="accessConfiguration"
              accessible={!!access?.Roles?.children?.AccessConfiguration?.access}
              fallback={
                <Typography.Link
                  disabled
                  onClick={() => {
                    setSelectedRoleNameGeneralPermissions({
                      username: entity.username,
                      generalPermissions: generalPermissions || [],
                      generalPermissionsChecks: generalPermissionsChecks || [],
                    });
                    setConfigAccessModalVisible(true);
                  }}
                >
                  {intl.formatMessage({
                    id: 'button.config-access',
                  })}
                </Typography.Link>
              }
            >
              <Typography.Link
                onClick={() => {
                  setSelectedRoleNameGeneralPermissions({
                    username: entity.username,
                    generalPermissions: generalPermissions || [],
                    generalPermissionsChecks: generalPermissionsChecks || [],
                  });
                  setConfigAccessModalVisible(true);
                }}
              >
                {intl.formatMessage({
                  id: 'button.config-access',
                })}
              </Typography.Link>
            </Access> */}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <ProTable<RoleSettingsTableListItem, Pagination>
        rowKey="id"
        search={{
          labelWidth: 'auto',
          optionRender(searchConfig, formProps) {
            return [
              <Button key="rest" onClick={() => formProps?.form?.resetFields?.()}>
                {searchConfig.resetText}
              </Button>,
              <Button
                key="submit"
                type="primary"
                onClick={() => formProps?.form?.submit?.()}
                {...formProps?.submitter?.props?.submitButtonProps}
              >
                {searchConfig.searchText}
              </Button>,
            ];
          },
        }}
        headerTitle={intl.formatMessage({ id: 'menu.roles' })}
        actionRef={tableRef}
        columns={columns}
        pagination={paginationProps}
        request={handleFetchSysUserList}
        options={false}
        toolBarRender={() => [
          // <Access
          //   key="upload"
          //   accessible={!!access?.Roles?.children?.AddNewUser?.access}
          // >
          <Button
            key="upload"
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => {
              if (!!access?.Roles?.children?.AddNewRoles?.access) {
                setAddEditRoleModalVisible(true);
              }
            }}
            disabled={!access?.Roles?.children?.AddNewRoles?.access}
          >
            {intl.formatMessage({ id: 'button.add-new-role' })}
          </Button>,
          // </Access>,
        ]}
      ></ProTable>
      <AddEditRoleModal
        currentRow={currentRow}
        visible={addEditRoleModalVisible}
        onVisibleChange={setAddEditRoleModalVisible}
        onSubmit={() => {
          setAddEditRoleModalVisible(false);
          setCurrentRow(undefined);
          tableRef?.current?.reloadAndRest?.();
        }}
        close={() => {
          setAddEditRoleModalVisible(false);
          setCurrentRow(undefined);
        }}
      ></AddEditRoleModal>
      <ConfigAccessModal
        currentRow={currentRow}
        visible={configAccessModalVisible}
        onVisibleChange={setConfigAccessModalVisible}
        onSubmit={() => {
          setConfigAccessModalVisible(false);
          tableRef?.current?.reloadAndRest?.();
          refresh();
        }}
      ></ConfigAccessModal>
    </>
  );
};

export default Role;
