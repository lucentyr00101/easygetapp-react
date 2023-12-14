import React, { useEffect, useRef, useState } from 'react';

import { useApplicationContext } from '@/contexts/application.context';
import { useGlobalContext } from '@/contexts/global.context';
import { useIntl } from '@umijs/max';
import { history } from 'umi';

import { confirmDelete } from '@/global';
import { DownOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Divider, Dropdown, MenuProps, message, Space, theme, Typography } from 'antd';

import { APP_ATTRIBUTE_STATUS_CODE, APP_OS_CODE } from '@/pages/utils/dictionary.enum';
import { Pagination, paginationProps } from '@/pages/utils/utils';
import { appAttributeSearch, deleteAttributes } from '@/services/api/app-management';
import AddEditAttributesModal from './AddEditAttributesModal';
import { AttributesTableListItem } from './data';

const { useToken } = theme;

const AttributesSettings: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const { token } = useToken();

  const [activeKey, setActiveKey] = useState<React.Key>(APP_OS_CODE.ANDROID);
  const [currentRow, setCurrentRow] = useState<AttributesTableListItem>();
  const [isView, setIsView] = useState<boolean>(false);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const { appMessage } = useGlobalContext();
  const { handleGetCurrentAppDetails } = useApplicationContext();
  const { search } = history.location;
  const [addEditAttributesModalVisible, setAddEditAttributesModalVisible] =
    useState<boolean>(false);
  const [selectedList, setSelectedList] = useState<string[]>([]);

  const deleteAttributesHandler = (entityIds: string[] = []) => {
    confirmDelete({
      title: intl.formatMessage({
        id: `message.confirm.delete-app-attribute${entityIds.length > 1 ? 's' : ''}`,
      }),
      okText: intl.formatMessage({ id: 'button.delete' }),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await deleteAttributes({ entityIds });
          if (response.success) {
            message.success(
              intl.formatMessage({
                id: `message.success.delete-app-attribute${entityIds.length > 1 ? 's' : ''}`,
              }),
            );
            actionRef?.current?.reloadAndRest?.();
          }
        } catch (error: any) {
          appMessage({ type: 'error', apiResponse: error });
        }
      },
    });
  };

  const MoreBtn: React.FC = (props: any) => {
    const items: MenuProps['items'] = [
      {
        key: '1',
        label: (
          <a
            style={{ color: token.colorLink }}
            onClick={() => {
              setCurrentRow(props?.entity);
              setIsDuplicate(true);
              setAddEditAttributesModalVisible(true);
            }}
          >
            {intl.formatMessage({ id: 'button.duplicate' })}
          </a>
        ),
      },
      {
        key: '2',
        label: (
          <a
            style={{ color: token.colorLink }}
            onClick={() => {
              deleteAttributesHandler([props?.entity?.id]);
            }}
          >
            {intl.formatMessage({ id: 'button.delete' })}
          </a>
        ),
      },
    ];

    return (
      <Dropdown menu={{ items }}>
        <a>
          {intl.formatMessage({ id: 'button.more' })} <DownOutlined />
        </a>
      </Dropdown>
    );
  };

  // const tableListDataSource: AttributesTableListItem[] = [];
  const columns: ProColumns<AttributesTableListItem>[] = [
    {
      title: intl.formatMessage({ id: 'pages.app.version' }),
      dataIndex: 'versionNumber',
      fieldProps: {
        placeholder: intl.formatMessage({ id: 'pages.app.version.placeholder' }),
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.app.attributes' }),
      dataIndex: 'attributeString',
      ellipsis: true,
      fieldProps: {
        placeholder: intl.formatMessage({ id: 'pages.app.attributes' }),
      },
      search: false,
    },
    {
      hideInTable: true,
      title: intl.formatMessage({ id: 'pages.app.parameter-name' }),
      key: 'parameterName',
      fieldProps: {
        placeholder: intl.formatMessage({ id: 'pages.app.parameter-name.placeholder' }),
      },
    },
    {
      hideInTable: true,
      title: intl.formatMessage({ id: 'pages.app.parameter' }),
      key: 'parameter',
      fieldProps: {
        placeholder: intl.formatMessage({ id: 'pages.app.parameter.placeholder' }),
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.app.operating-system' }),
      dataIndex: 'operatingSystem',
      // ellipsis: true,
      fieldProps: {
        placeholder: intl.formatMessage({ id: 'pages.app.operating-system' }),
      },
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.app.version-status' }),
      dataIndex: 'status',
      // ellipsis: true,
      initialValue: APP_ATTRIBUTE_STATUS_CODE.ALL,
      valueEnum: {
        [APP_ATTRIBUTE_STATUS_CODE.ALL]: intl.formatMessage({ id: 'dropdown.select.all' }),
        [APP_ATTRIBUTE_STATUS_CODE.DRAFT]: intl.formatMessage({ id: 'dropdown.select.draft' }),
        [APP_ATTRIBUTE_STATUS_CODE.LIVE]: intl.formatMessage({ id: 'dropdown.select.live' }),
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.app.created-by' }),
      dataIndex: 'createdBy',
      // ellipsis: true,
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.app.created-time' }),
      dataIndex: 'createdTime',
      // ellipsis: true,
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.app.updated-by' }),
      dataIndex: 'updatedBy',
      // ellipsis: true,
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.app.updated-time' }),
      dataIndex: 'updatedTime',
      // ellipsis: true,
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.common.action' }),
      width: '190px',
      key: 'option',
      valueType: 'option',
      render: (value, entity: any) => {
        return (
          <Space split={<Divider type="vertical" />}>
            <Typography.Link
              onClick={() => {
                setCurrentRow(entity);
                setIsView(true);
                setAddEditAttributesModalVisible(true);
              }}
            >
              {intl.formatMessage({ id: 'button.view' })}
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                setCurrentRow(entity);
                setAddEditAttributesModalVisible(true);
              }}
            >
              {intl.formatMessage({ id: 'button.edit' })}
            </Typography.Link>
            <MoreBtn key="more" {...{ entity }} />
          </Space>
        );
      },
    },
  ];

  const fetchList = async (values: any) => {
    const {
      pageSize: size,
      current: page,
      versionNumber,
      parameterName,
      parameter,
      status,
    } = values;
    const queryParams = new URLSearchParams(history.location.search);
    const appName = queryParams.get('appName') || '';

    // console.log(values);

    const filter: any = {
      size,
      page: page - 1,
      operatingSystem: activeKey,
      appName: appName,
      versionNumber,
      parameterName,
      parameter,
      status,
    };

    try {
      const { data } = await appAttributeSearch(filter);
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

  useEffect(() => {
    const queryParams = new URLSearchParams(search);
    const id = queryParams.get('id') || '';
    (async () => {
      try {
        await handleGetCurrentAppDetails(id);
      } catch (error: any) {
        appMessage({ type: 'error', apiResponse: error });
      }
    })();
    actionRef?.current?.reloadAndRest?.();
  }, [search]);

  return (
    <>
      <ProTable<AttributesTableListItem, Pagination>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        pagination={paginationProps}
        options={false}
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedRowKeys: React.Key[]) => {
            // console.log('selectedRowKeys:', selectedRowKeys);
            setSelectedList([...selectedRowKeys] as string[]);
          },
        }}
        toolBarRender={() => [
          <Button
            key="bulk-delete"
            type="primary"
            onClick={() => {
              deleteAttributesHandler([...selectedList]);
            }}
            disabled={selectedList.length <= 0}
          >
            {intl.formatMessage({ id: 'component.app.bulk-delete-version' })}
          </Button>,
          <Button
            key="upload"
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => {
              setAddEditAttributesModalVisible(true);
            }}
          >
            {intl.formatMessage({ id: 'component.app.add-attributes' })}
          </Button>,
        ]}
        search={{
          labelWidth: 'auto',
          optionRender(searchConfig: any, formProps: any) {
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
        request={fetchList}
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activeKey,
            items: [
              {
                key: APP_OS_CODE.ANDROID,
                label: (
                  <span style={{ fontSize: '15px' }}>
                    {' '}
                    {intl.formatMessage({ id: 'pages.app.attributes.android' })}
                  </span>
                ),
              },
              {
                key: APP_OS_CODE.IOS,
                label: (
                  <span style={{ fontSize: '15px' }}>
                    {intl.formatMessage({ id: 'pages.app.attributes.IOS' })}
                  </span>
                ),
              },
            ],
            onChange: (key) => {
              setActiveKey(key as string);
              actionRef?.current?.reloadAndRest?.();
            },
          },
        }}
      ></ProTable>
      <AddEditAttributesModal
        appOS={activeKey}
        currentRow={currentRow}
        isView={isView}
        isDuplicate={isDuplicate}
        visible={addEditAttributesModalVisible}
        onVisibleChange={setAddEditAttributesModalVisible}
        refreshTable={() => actionRef?.current?.reloadAndRest?.()}
        close={() => {
          setAddEditAttributesModalVisible(false);
          setCurrentRow(undefined);
          setIsView(false);
          setIsDuplicate(false);
        }}
      />
    </>
  );
};

export default AttributesSettings;
