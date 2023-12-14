import GACodeModal from '@/components/GACode';
import { DropdownContext } from '@/contexts/dropdown.context';
import { fetchSysUserSearch } from '@/services/api/user-settings';
import { PlusCircleOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { useAccess, useIntl, useModel } from '@umijs/max';
import { Button, Divider, Space, Typography } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { STATUS_CODE } from '../utils/dictionary.enum';
// import { STATUS_CODE } from '../utils/dictionary.enum';
import { Pagination, paginationProps } from '../utils/utils';
import AddEditUserModal from './AddEditUserModal';
import ConfigAccessModal from './ConfigAccessModal';
import { SelectedUserNameGeneralPermissionItem, UserSettingsTableListItem } from './data';

import { useGlobalContext } from '@/contexts/global.context';

const UserSettings: React.FC = () => {
  const { appMessage } = useGlobalContext();
  const intl = useIntl();
  const access: any = useAccess();
  const tableRef = useRef<ActionType>();
  const { statusType, userType, roles, handleGetDropdownRoles } = useContext(DropdownContext);
  const { refresh } = useModel('@@initialState');

  const [selectedUserNameGeneralPermissions, setSelectedUserNameGeneralPermissions] =
    useState<SelectedUserNameGeneralPermissionItem>({ username: '' });
  const [currentRow, setCurrentRow] = useState<UserSettingsTableListItem>();
  const [addEditUserModalVisible, setAddEditUserModalVisible] = useState<boolean>(false);
  const [configAccessModalVisible, setConfigAccessModalVisible] = useState<boolean>(false);
  const [editGACodeModalVisible, setEditGACodeModalVisible] = useState<boolean>(false);

  const dropdownInitial = {
    All: {
      text: intl.formatMessage({
        id: 'dropdown.select.all',
      }),
    },
  };

  const statusTypeEnum = statusType.reduce(
    (prev: any, curr: any) => ({
      ...prev,
      [curr]: {
        text: intl.formatMessage({
          id: `dropdown.select.${curr.toLowerCase()}`,
        }),
      },
    }),
    dropdownInitial,
  );

  const rolesEnum = roles.reduce((prev: any, curr: any) => {
    return {
      ...prev,
      [curr.id]: { text: curr.name },
    };
  }, dropdownInitial);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const userTypeEnum = userType.reduce(
    (prev: any, curr: any) => ({
      ...prev,
      [curr]: {
        text: intl.formatMessage({
          id: `dropdown.select.${curr.toLowerCase()}`,
        }),
      },
    }),
    {
      All: {
        text: intl.formatMessage({
          id: 'dropdown.select.all',
        }),
      },
    },
  );

  const handleFetchSysUserList = async (values: any) => {
    const { pageSize: size, current: page, username, roles, status } = values;
    const filter: any = {
      size,
      page: page - 1,
      account: username,
      status: status.toLowerCase() === 'all' ? undefined : status,
      roleId: roles.toLowerCase() === 'all' ? undefined : roles,
    };
    try {
      const { data } = await fetchSysUserSearch(filter);
      return Promise.resolve({
        data: data?.data,
        success: true,
        totalPages: data?.totalPages,
        total: data?.totalElements,
      });
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
      return {};
    }
  };

  // const handleUpdateStatus = async (values: any, checked: boolean) => {
  //   try {
  //     await updateSysUserStatus({
  //       id: values.id,
  //       status: checked ? STATUS_CODE.ENABLE : STATUS_CODE.DISABLE,
  //     });
  //     showNotification({
  //       message: intl.formatMessage({ id: 'notification.user.updated' }),
  //       type: 'success',
  //     });
  //     tableRef?.current?.reloadAndRest?.();
  //   } catch (e: any) {
  //     showNotification({
  //       message: e?.response?.data?.message || intl.formatMessage({ id: 'something-went-wrong' }),
  //       type: 'error',
  //     });
  //   }
  // };

  const columns: ProColumns<UserSettingsTableListItem>[] = [
    {
      title: intl.formatMessage({
        id: 'pages.userSetting.userName',
      }),
      dataIndex: 'username',
    },
    {
      title: intl.formatMessage({
        id: 'pages.userSetting.roles',
      }),
      dataIndex: 'roles',
      render: (text, entity: any) => {
        const rolesList = entity.roles.map((val: any) => {
          return val.name;
        });
        return <span>{rolesList.join(',')}</span>;
      },
      valueType: 'select',
      valueEnum: rolesEnum,
      initialValue: 'All',
    },
    // {
    //   title: intl.formatMessage({
    //     id: 'pages.userSetting.userType',
    //   }),
    //   dataIndex: 'userType',
    //   valueType: 'select',
    //   valueEnum: userTypeEnum,
    //   initialValue: 'All',
    // },
    {
      title: intl.formatMessage({
        id: 'pages.common.createdTime',
      }),
      dataIndex: 'createdTime',
      search: false,
    },
    {
      title: intl.formatMessage({
        id: 'pages.userSetting.createdBy',
      }),
      dataIndex: 'createdBy',
      search: false,
    },
    {
      title: intl.formatMessage({
        id: 'pages.common.status',
      }),
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: statusTypeEnum,
      initialValue: 'All',
      render: (text, entity) => (
        <span style={{ color: entity.status === STATUS_CODE.ENABLE ? '#2FD349' : '#FF0000' }}>
          {text}
        </span>
      ),
      // render: (_, value) => (
      //   <Switch
      //     checked={value.status === STATUS_CODE.ENABLE}
      //     onChange={(checked) => {
      //       handleUpdateStatus(value, checked);
      //     }}
      //   />
      // ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.common.action',
      }),
      key: 'option',
      valueType: 'option',
      render: (value, entity: any) => {
        // const generalPermissions = entity.generalPermissions;
        // const generalPermissionsChecks = entity.generalPermissionsChecks;

        return (
          <Space split={<Divider type="vertical" />}>
            {/* <Access
              key="edit"
              accessible={access?.UserSettings?.children?.Edit?.access || false}
              fallback={
                <Typography.Link
                  disabled
                  onClick={() => {
                    setCurrentRow(entity);
                    setAddEditUserModalVisible(true);
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
                if (!!access?.UserSettings?.children?.Edit?.access) {
                  setCurrentRow(entity);
                  setAddEditUserModalVisible(true);
                }
              }}
              disabled={!access?.UserSettings?.children?.Edit?.access}
            >
              {intl.formatMessage({
                id: 'button.edit',
              })}
            </Typography.Link>
            {/* </Access> */}
            {/* <Access
              key="resetGACode"
              accessible={access?.UserSettings?.children?.ResetGACode?.access || false}
              fallback={
                <Typography.Link
                  disabled
                  onClick={() => {
                    setCurrentRow(entity);
                    setEditGACodeModalVisible(true);
                  }}
                >
                  {intl.formatMessage({
                    id: 'button.reset-ga-code',
                  })}
                </Typography.Link>
              }
            > */}
            <Typography.Link
              onClick={() => {
                if (!!access?.UserSettings?.children?.ResetGACode?.access) {
                  setCurrentRow(entity);
                  setEditGACodeModalVisible(true);
                }
              }}
              disabled={!access?.UserSettings?.children?.ResetGACode?.access}
            >
              {intl.formatMessage({
                id: 'button.reset-ga-code',
              })}
            </Typography.Link>
            {/* </Access> */}
            {/* <Access
              key="accessConfiguration"
              accessible={access?.UserSettings?.children?.AccessConfiguration?.access || false}
              fallback={
                <Typography.Link
                  disabled
                  onClick={() => {
                    setSelectedUserNameGeneralPermissions({
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
                  setSelectedUserNameGeneralPermissions({
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

  useEffect(() => {
    handleGetDropdownRoles();
  }, []);

  return (
    <>
      <ProTable<UserSettingsTableListItem, Pagination>
        headerTitle={intl.formatMessage({
          id: 'menu.user-settings',
        })}
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
        rowKey="id"
        actionRef={tableRef}
        columns={columns}
        pagination={paginationProps}
        request={handleFetchSysUserList}
        options={false}
        toolBarRender={() => [
          // <Access
          //   key="upload"
          //   accessible={access?.UserSettings?.children?.AddNewUser?.access || false}
          // >
          <Button
            key="upload"
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => {
              if (!!access?.UserSettings?.children?.AddNewUser?.access) {
                setAddEditUserModalVisible(true);
              }
            }}
            disabled={!access?.UserSettings?.children?.AddNewUser?.access}
          >
            {intl.formatMessage({
              id: 'button.add-new-user',
            })}
          </Button>,
          // </Access>,
        ]}
      ></ProTable>
      <GACodeModal
        currentRow={currentRow}
        visible={editGACodeModalVisible}
        onVisibleChange={setEditGACodeModalVisible}
      ></GACodeModal>
      <AddEditUserModal
        currentRow={currentRow}
        visible={addEditUserModalVisible}
        onVisibleChange={setAddEditUserModalVisible}
        onSubmit={() => {
          setAddEditUserModalVisible(false);
          setCurrentRow(undefined);
          tableRef?.current?.reloadAndRest?.();
        }}
        close={() => {
          setAddEditUserModalVisible(false);
          setCurrentRow(undefined);
        }}
      ></AddEditUserModal>
      <ConfigAccessModal
        selectedUserNameGeneralPermissionValues={selectedUserNameGeneralPermissions}
        visible={configAccessModalVisible}
        onVisibleChange={setConfigAccessModalVisible}
        onSubmit={() => {
          setConfigAccessModalVisible(false);
          setSelectedUserNameGeneralPermissions({ username: '' });
          tableRef?.current?.reloadAndRest?.();
          refresh();
        }}
      ></ConfigAccessModal>
    </>
  );
};

export default UserSettings;
