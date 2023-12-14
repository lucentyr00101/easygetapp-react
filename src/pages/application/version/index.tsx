import React, { useEffect, useRef, useState } from 'react';

import { useApplicationContext } from '@/contexts/application.context';
import { useGlobalContext } from '@/contexts/global.context';
import { useIntl } from '@umijs/max';
import { history } from 'umi';

import QRModal from '@/components/Global/QRModal';
import { CheckCircleOutlined, DownOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import {
  Button,
  Divider,
  Dropdown,
  MenuProps,
  message,
  notification,
  Space,
  Tag,
  theme,
  Typography,
} from 'antd';

import { APP_OS_CODE, APP_STATUS_CODE } from '@/pages/utils/dictionary.enum';
import { Pagination, paginationProps } from '@/pages/utils/utils';

import { appVersionSearch, archiveVersion, deleteVersion } from '@/services/api/app-management';

import { convertFileSize, statusColorMap } from '@/global';
import AddEditVersionModal from './AddEditVersionModal';
import { VersionTableListItem } from './data';

const { useToken } = theme;

const Version: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const { token } = useToken();

  const [activeKey, setActiveKey] = useState<React.Key>(APP_OS_CODE.ANDROID);
  const [currentRow, setCurrentRow] = useState<VersionTableListItem>();
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentQRUrl, setCurrentQRUrl] = useState('');
  const { appMessage } = useGlobalContext();
  const { /*currentApp,*/ handleGetCurrentAppSubscription, handleGetCurrentAppDetails } =
    useApplicationContext();
  const { search } = history.location;
  const [addEditVersionModalVisible, setAddEditVersionModalVisible] = useState<boolean>(false);

  const deleteVersionHandler = async (id: any) => {
    try {
      const response = await deleteVersion({ entityIds: [id] });
      if (response.success) {
        message.success(intl.formatMessage({ id: 'success' }));
        actionRef?.current?.reloadAndRest?.();
      }
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
  };

  const archiveVersionHandler = async (data: any) => {
    try {
      const response = await archiveVersion({ id: data?.id });
      if (response.success) {
        message.success(intl.formatMessage({ id: 'success' }));
        actionRef?.current?.reloadAndRest?.();
      }
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
  };

  const qrCodeVersionHandler = async (data: any) => {
    setCurrentQRUrl(data?.qrCode?.fileLink);
    setShowQRModal(true);
    // window.open(
    //   `${currentApp?.installationPageFullLink}/?version=${data?.id}&specificVersion=true`,
    //   '_blank',
    // );
  };

  const downloadVersionHandler = async (data: any) => {
    const downloadFile = document.createElement('a');
    downloadFile.href = data.appFile.fileLink;
    // downloadFile.target = '_blank';
    downloadFile.click();
  };

  const copyLinkVersionHandler = async (data: any) => {
    const { operatingSystem, superDistributionLink } = data;
    const url = operatingSystem === 'Android' ? data.appFile.fileLink : superDistributionLink;
    navigator.clipboard.writeText(
      // `${currentApp?.installationPageFullLink}/?version=${data?.id}&specificVersion=true`,
      url,
    );
    notification.success({
      icon: <CheckCircleOutlined />,
      style: { color: '#52C41A' },
      message: intl.formatMessage({ id: 'notification.copy' }),
    });
  };

  const MoreBtn: React.FC = (props: any) => {
    const items: MenuProps['items'] = [
      ...(/^archive$/gi.test(props?.entity?.versionStatus)
        ? []
        : [
            {
              key: '1',
              label: (
                <a
                  style={{ color: token.colorLink }}
                  onClick={() => {
                    archiveVersionHandler(props?.entity);
                  }}
                >
                  {intl.formatMessage({ id: 'button.archive-version' })}
                </a>
              ),
            },
          ]),
      {
        key: '2',
        label: (
          <a
            style={{ color: token.colorLink }}
            onClick={() => {
              qrCodeVersionHandler(props?.entity);
            }}
          >
            {intl.formatMessage({ id: 'button.version-qr-code' })}
          </a>
        ),
      },
      ...(!props?.entity?.appFile
        ? []
        : [
            {
              key: '3',
              label: (
                <a
                  style={{ color: token.colorLink }}
                  onClick={() => {
                    downloadVersionHandler(props?.entity);
                  }}
                >
                  {intl.formatMessage({ id: 'button.download' })}
                </a>
              ),
            },
          ]),
      {
        key: '4',
        label: (
          <a
            style={{ color: token.colorLink }}
            onClick={() => {
              copyLinkVersionHandler(props?.entity);
            }}
          >
            {intl.formatMessage({ id: 'button.copy-link' })}
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

  // const tableListDataSource: VersionTableListItem[] = [];
  const columns: ProColumns<VersionTableListItem>[] = [
    {
      title: intl.formatMessage({ id: 'pages.app.version' }),
      dataIndex: 'versionNumber',
      fieldProps: {
        placeholder: intl.formatMessage({ id: 'pages.app.version' }),
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.app.build' }),
      dataIndex: 'buildNumber',
      fieldProps: {
        placeholder: intl.formatMessage({ id: 'pages.app.build' }),
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.app.size' }),
      // dataIndex: 'size',
      search: false,
      hideInTable: activeKey === APP_OS_CODE.IOS ? true : false,
      dataIndex: ['appFile', 'fileSizeKb'],
      render: (text) => (text === '-' ? text : convertFileSize(text as number)),
    },
    {
      title: intl.formatMessage({ id: 'pages.app.downloads' }),
      dataIndex: 'downloadCount',
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'component.app.created-by' }),
      dataIndex: 'createdBy',
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.app.created-time' }),
      dataIndex: 'createdTime',
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.app.version-status' }),
      dataIndex: 'versionStatus',
      initialValue: APP_STATUS_CODE.ALL,
      valueEnum: {
        [APP_STATUS_CODE.ALL]: intl.formatMessage({ id: 'dropdown.select.all' }),
        [APP_STATUS_CODE.PUBLISH]: intl.formatMessage({ id: 'dropdown.select.publish' }),
        [APP_STATUS_CODE.ARCHIVE]: intl.formatMessage({ id: 'dropdown.select.archive' }),
        [APP_STATUS_CODE.EXPIRED]: intl.formatMessage({ id: 'dropdown.select.expired' }),
        [APP_STATUS_CODE.INVALID]: intl.formatMessage({ id: 'dropdown.select.invalid' }),
      },
      render: (text, record) => <Tag color={statusColorMap(record.versionStatus)}>{text}</Tag>,
    },
    {
      title: intl.formatMessage({ id: 'pages.common.action' }),
      key: 'option',
      valueType: 'option',
      render: (value, entity: any) => {
        return (
          <Space split={<Divider type="vertical" />}>
            <Typography.Link
              onClick={() => {
                setCurrentRow(entity);
                setAddEditVersionModalVisible(true);
              }}
            >
              {intl.formatMessage({ id: 'button.edit' })}
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                deleteVersionHandler(entity?.id);
              }}
            >
              {intl.formatMessage({ id: 'button.remove' })}
            </Typography.Link>
            <MoreBtn key="more" {...{ entity }} />
          </Space>
        );
      },
    },
  ];

  const fetchList = async (values: any) => {
    const { pageSize: size, current: page, versionNumber, buildNumber, versionStatus } = values;
    const queryParams = new URLSearchParams(history.location.search);
    const appName = queryParams.get('appName') || '';

    // console.log(values);

    const filter: any = {
      size,
      age: page - 1,
      operatingSystem: activeKey,
      appName: appName,
      versionNumber,
      buildNumber,
      versionStatus,
    };

    try {
      const { data } = await appVersionSearch(filter);
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
    if (addEditVersionModalVisible) {
      (async () => {
        try {
          await handleGetCurrentAppSubscription();
        } catch (error) {
          appMessage({ type: 'error', apiResponse: error });
        }
      })();
    }
  }, [addEditVersionModalVisible]);

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
      <ProTable<VersionTableListItem, Pagination>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        pagination={paginationProps}
        options={false}
        toolBarRender={() => [
          <Button
            key="upload"
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => {
              setAddEditVersionModalVisible(true);
            }}
          >
            {intl.formatMessage({ id: 'component.app.add-version' })}
          </Button>,
        ]}
        search={{
          labelWidth: 'auto',
          optionRender(searchConfig, formProps: any) {
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
              actionRef.current?.reload?.();
            },
          },
        }}
      />
      <AddEditVersionModal
        appOS={activeKey}
        currentRow={currentRow}
        visible={addEditVersionModalVisible}
        onVisibleChange={setAddEditVersionModalVisible}
        refreshTable={() => actionRef?.current?.reloadAndRest?.()}
        close={() => {
          setAddEditVersionModalVisible(false);
          setCurrentRow(undefined);
        }}
      />
      <QRModal
        open={showQRModal}
        link={currentQRUrl}
        cancel={() => {
          setShowQRModal(false);
          setCurrentQRUrl('');
        }}
      />
    </>
  );
};

export default Version;
