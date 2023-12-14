import { TabType } from '@/app-data';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Col, Divider, message, Row, Space, Spin, Tag, Typography } from 'antd';

import { history, useAccess, useIntl, useModel } from 'umi';
import App from './app';

import { LoadingOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import useStateRef from 'react-usestateref';
import { APP_STATUS_CODE, APP_TAB_SIDEMENU_CODE } from '../utils/dictionary.enum';
import { paginationProps } from '../utils/utils';
import PageSideCard from './components/PageSideCard';
import UploadAppModal from './UploadAppModal';
import Version from './version';

import { useApplicationContext } from '@/contexts/application.context';
import { useGlobalContext } from '@/contexts/global.context';
import { deleteApp, deployApp, fetchApps, getAppPreview } from '@/services/api/app-management';

import { confirmDelete, convertFileSize, statusColorMap } from '@/global';
import APIDocumentation from './attributes/api-documentation';
import AttributesSettings from './attributes/attributes-settings';
import TemplateConfiguration from './attributes/TemplateConfiguration';
import Statistics from './statistics';
import styles from './style.less';

type ApplicationListItem = {
  id: string;
  key: number;
  name: string;
  appId: string;
  version: any;
  build: string;
  size: string;
  createdBy: string;
  createdTime: string;
  status: string;
  icon: {
    fileLink: string;
  };
};

const Application: React.FC = () => {
  const intl = useIntl();
  const access: any = useAccess();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { appMessage } = useGlobalContext();
  const { currentApp, handleGetCurrentAppSubscription, handleGetCurrentAppDetails, fetchingApp } =
    useApplicationContext();

  const tableRef = useRef<ActionType>();
  const { tabList } = initialState || {};
  const { search } = history.location;

  const [currentTabSideMenu, setCurrentTabSideMenu] = useState(APP_TAB_SIDEMENU_CODE.APP);
  const [appUploadModalVisible, setAppUploadModalVisible] = useState<boolean>(false);
  const [processing, setProcessing, processingRef] = useStateRef<string[]>([]);

  const antIcon = <LoadingOutlined style={{ fontSize: 18 }} spin />;
  const loading = <Spin indicator={antIcon} />;

  const isAppNameExistInTabList = (appName: string) =>
    tabList?.some((tab: TabType) => tab.tab && tab.tab === appName);

  // const getAppNameIsExistInTabList = (appName: string) =>
  //   tabList?.filter((tab: TabType) => tab.tab && tab.tab === appName)[0];

  const handleAdd = (value: ApplicationListItem) => {
    if (!isAppNameExistInTabList(value.name)) {
      setInitialState((s) => ({
        ...s,
        tabList: s?.tabList
          ? [
              ...s?.tabList,
              {
                tab: value.name,
                // currentTabSideMenu: currentTabSideMenu,
                skipTranslate: true,
                key: `/application?id=${value.id}&appName=${value.name.replace(/\s/g, '%20')}`,
                path: `/application?id=${value.id}&appName=${value.name.replace(/\s/g, '%20')}`,
              },
            ]
          : [],
      }));
    }
    history.push(`/application?id=${value.id}&appName=${value.name.replace(/\s/g, '%20')}`);
  };

  const handleChangeMenu = (menu: string) => {
    // const appNameInTabList = getAppNameIsExistInTabList(currentAppName);
    // const filterTabList = tabList?.map((value) => {

    //   if (appNameInTabList && value.appName === appNameInTabList.appName) {
    //     return {...appNameInTabList, currentTabSideMenu: currentTabSideMenu};
    //   }

    //   return value;
    // });

    // setInitialState((s) => ({
    //   ...s,
    //   tabList: filterTabList ? filterTabList : (s?.tabList || []),
    // }));

    setCurrentTabSideMenu(menu);
  };

  const deployAppHandler = async (id: any) => {
    setProcessing((prevProcessing: string[]) => [...prevProcessing, id]);
    try {
      const { data } = await deployApp(id);
      if (data) message.success(intl.formatMessage({ id: 'notification.app.deployed' }));
      const _array = [...processingRef.current].filter((x) => x !== id);
      setProcessing(() => _array);
    } catch (e) {
      console.log(e);
    }
  };

  // useEffect(() => {
  //   console.log(processing)
  // }, [processing])

  const previewHandler = async (id: any) => {
    await getAppPreview(id).then((response: any) => {
      const { data }: any = response;
      if (data) {
        window.open(data, '_blank');
      }
    });
  };

  const handleDelete = async (ids: string[]) => {
    try {
      await deleteApp({ entityIds: [...ids] });
      message.success(intl.formatMessage({ id: 'notification.app.deleted' }));
      tableRef?.current?.reloadAndRest?.();
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
  };

  const columns: ProColumns<ApplicationListItem>[] = [
    {
      title: intl.formatMessage({ id: 'pages.app.appName' }),
      dataIndex: 'name',
      // Commented for future use - jan
      // render: (text, record) => {
      //   return (
      //     <div style={{ display: 'flex', alignItems: 'center' }}>
      //       <img
      //         src={record?.icon?.fileLink}
      //         width={50}
      //         height={50}
      //         style={{ borderRadius: 10 }}
      //       ></img>
      //       <p style={{ padding: 0, margin: 14 }}>{text}</p>
      //     </div>
      //   );
      // },
    },
    {
      title: intl.formatMessage({ id: 'pages.app.appId' }),
      dataIndex: 'appId',
    },
    {
      title: intl.formatMessage({ id: 'pages.app.version' }),
      dataIndex: ['version', 'versionNumber'],
    },
    {
      title: intl.formatMessage({ id: 'pages.app.build' }),
      dataIndex: ['version', 'buildNumber'],
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.app.size' }),
      dataIndex: ['version', 'appFile', 'fileSizeKb'],
      search: false,
      render: (text) => (text === '-' ? text : convertFileSize(text as number)),
    },
    // {
    //   title: intl.formatMessage({ id: 'pages.app.downloads' }),
    //   dataIndex: ['version', 'downloadCount'],
    //   search: false,
    //   render: (text) => (text === '-' ? 0 : text),
    // },
    {
      title: intl.formatMessage({ id: 'component.app.created-by' }),
      dataIndex: 'createdBy',
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.common.createdTime' }),
      dataIndex: 'createdTime',
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.common.status' }),
      dataIndex: ['version', 'versionStatus'],
      search: false,
      valueEnum: {
        [APP_STATUS_CODE.ALL]: intl.formatMessage({ id: 'dropdown.select.all' }),
        [APP_STATUS_CODE.PUBLISH]: intl.formatMessage({ id: 'dropdown.select.publish' }),
        [APP_STATUS_CODE.ARCHIVE]: intl.formatMessage({ id: 'dropdown.select.archive' }),
        [APP_STATUS_CODE.EXPIRED]: intl.formatMessage({ id: 'dropdown.select.expired' }),
        [APP_STATUS_CODE.INVALID]: intl.formatMessage({ id: 'dropdown.select.invalid' }),
      },
      render: (text, record) => (
        <Tag color={statusColorMap(record?.version?.versionStatus)}>{text}</Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.common.action' }),
      key: 'option',
      valueType: 'option',
      width: '300px',
      render: (text, record) => {
        return (
          <Space split={<Divider type="vertical" />}>
            <Typography.Link
              onClick={() => {
                if (!!access?.AppManagement?.children?.Enter?.access) {
                  handleAdd(record);
                }
              }}
              disabled={!access?.AppManagement?.children?.Enter?.access}
            >
              {intl.formatMessage({ id: 'pages.app.enter' })}
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                if (!!access?.AppManagement?.children?.Preview?.access) {
                  previewHandler(record.id);
                }
              }}
              disabled={!access?.AppManagement?.children?.Preview?.access}
            >
              {intl.formatMessage({ id: 'button.preview' })}
            </Typography.Link>
            {processing.includes(record.id) ? (
              loading
            ) : (
              <Typography.Link
                onClick={() => {
                  if (!!access?.AppManagement?.children?.Deploy?.access) {
                    deployAppHandler(record.id);
                  }
                }}
                disabled={!access?.AppManagement?.children?.Deploy?.access}
              >
                {intl.formatMessage({ id: 'button.deploy' })}
              </Typography.Link>
            )}
            <Typography.Link
              onClick={() => {
                if (!!access?.AppManagement?.children?.Delete?.access) {
                  confirmDelete({
                    title: intl.formatMessage({ id: 'message.confirm.delete-app' }),
                    okText: intl.formatMessage({ id: 'button.delete' }),
                    okButtonProps: { danger: true },
                    onOk: () => handleDelete([record.id]),
                  });
                }
              }}
              disabled={!access?.AppManagement?.children?.Delete?.access}
            >
              {intl.formatMessage({ id: 'pages.common.delete' })}
            </Typography.Link>
          </Space>
        );
      },
    },
  ];

  const fetchList = async (values: any) => {
    const { pageSize: size, current: page, name, appId, version } = values;
    const { versionNumber } = version || {};
    const filter: any = {
      size,
      page: page - 1,
      name,
      version: versionNumber,
      appId,
    };
    try {
      const { data } = await fetchApps(filter);
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
    if (appUploadModalVisible) {
      (async () => {
        try {
          await handleGetCurrentAppSubscription();
        } catch (error) {
          appMessage({ type: 'error', apiResponse: error });
        }
      })();
    }
  }, [appUploadModalVisible]);

  useEffect(() => {
    const queryParams = new URLSearchParams(search);
    const id = queryParams.get('id') || '';
    if (id) {
      (async () => {
        try {
          await handleGetCurrentAppDetails(id);
        } catch (error: any) {
          appMessage({ type: 'error', apiResponse: error });
        }
      })();
    }
  }, [search]);

  return (
    <>
      {search === '' ? (
        <>
          <ProTable<ApplicationListItem>
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
            actionRef={tableRef}
            headerTitle={intl.formatMessage({ id: 'pages.app.header' })}
            columns={columns}
            options={false}
            pagination={paginationProps}
            request={fetchList}
            toolBarRender={() => [
              <Button
                key="upload"
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  if (!!access?.AppManagement?.children?.UploadApp?.access) {
                    setAppUploadModalVisible(true);
                  }
                }}
                disabled={!access?.AppManagement?.children?.UploadApp?.access}
              >
                {intl.formatMessage({ id: 'pages.app.uploadApp' })}
              </Button>,
            ]}
          ></ProTable>
          <UploadAppModal
            refreshTable={() => tableRef?.current?.reloadAndRest?.()}
            visible={appUploadModalVisible}
            onVisibleChange={setAppUploadModalVisible}
          ></UploadAppModal>
        </>
      ) : (
        <Row gutter={8}>
          <Col span={5}>
            <PageSideCard
              tabMenu={true}
              loading={fetchingApp}
              menuMapItem={[
                {
                  label: intl.formatMessage({
                    id: 'pages.app.app',
                    defaultMessage: 'App',
                  }),
                  key: APP_TAB_SIDEMENU_CODE.APP,
                },
                {
                  label: intl.formatMessage({
                    id: 'pages.app.version',
                    defaultMessage: 'Version',
                  }),
                  key: APP_TAB_SIDEMENU_CODE.VERSION,
                },
                {
                  label: intl.formatMessage({
                    id: 'pages.app.statistics',
                    defaultMessage: 'Statistics',
                  }),
                  key: APP_TAB_SIDEMENU_CODE.STATISTICS,
                },
                {
                  label: intl.formatMessage({
                    id: 'pages.app.attributes-management',
                    defaultMessage: 'Attributes',
                  }),
                  key: APP_TAB_SIDEMENU_CODE.ATTRIBUTES,
                  children: [
                    {
                      label: intl.formatMessage({
                        id: 'pages.app.attributes.settings',
                        defaultMessage: 'Attributes Settings',
                      }),
                      key: APP_TAB_SIDEMENU_CODE.ATTRIBUTES_SETTINGS,
                    },
                    {
                      label: intl.formatMessage({
                        id: 'pages.app.api.documentation',
                        defaultMessage: 'API Documentation',
                      }),
                      key: APP_TAB_SIDEMENU_CODE.ATTRIBUTES_API,
                    },
                  ],
                },
                {
                  label: intl.formatMessage({
                    id: 'pages.app.template-configuration',
                    defaultMessage: 'Template Configuration',
                  }),
                  key: APP_TAB_SIDEMENU_CODE.TEMPLATE_CONFIGURATION,
                },
              ]}
              defaultSelectKey={currentTabSideMenu}
              onChangeMenu={handleChangeMenu}
              content={{
                id: currentApp?.id || 1,
                avatar: currentApp?.icon?.fileLink || null,
                name: currentApp?.name,
                desc: () => {
                  return (
                    <>
                      <p>
                        {intl.formatMessage({
                          id: 'pages.app.platform',
                          defaultMessage: 'Platform',
                        })}
                        : {currentApp?.currentAndroidVersion?.operatingSystem}
                        {currentApp?.currentIOSVersion && currentApp?.currentAndroidVersion && (
                          <span className={styles['vertical-line']}></span>
                        )}
                        {currentApp?.currentIOSVersion?.operatingSystem}
                      </p>
                      <p>
                        {intl.formatMessage({
                          id: 'pages.app.appId',
                          defaultMessage: 'App ID',
                        })}
                        : {currentApp?.appId}
                      </p>
                      <p>
                        {intl.formatMessage({
                          id: 'pages.app.version',
                          defaultMessage: 'Version',
                        })}
                        : {currentApp?.currentAndroidVersion?.versionNumber}
                        {currentApp?.currentIOSVersion && currentApp?.currentAndroidVersion && (
                          <span className={styles['vertical-line']}></span>
                        )}
                        {currentApp?.currentIOSVersion?.versionNumber}
                      </p>
                    </>
                  );
                },
              }}
            />
          </Col>
          <Col span={19}>
            <Spin spinning={fetchingApp}>
              {currentTabSideMenu === APP_TAB_SIDEMENU_CODE.APP && <App />}
              {currentTabSideMenu === APP_TAB_SIDEMENU_CODE.VERSION && <Version />}
              {currentTabSideMenu === APP_TAB_SIDEMENU_CODE.STATISTICS && <Statistics />}
              {currentTabSideMenu === APP_TAB_SIDEMENU_CODE.ATTRIBUTES_SETTINGS && (
                <AttributesSettings />
              )}
              {currentTabSideMenu === APP_TAB_SIDEMENU_CODE.ATTRIBUTES_API && <APIDocumentation />}
              {currentTabSideMenu === APP_TAB_SIDEMENU_CODE.TEMPLATE_CONFIGURATION && (
                <TemplateConfiguration />
              )}
            </Spin>
          </Col>
        </Row>
      )}
    </>
  );
};

export default Application;
