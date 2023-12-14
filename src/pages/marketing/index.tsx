import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Divider, message, Space, Typography } from 'antd';
import { FC, useState } from 'react';

import { useIntl } from 'umi';

import { PlusCircleOutlined } from '@ant-design/icons';
import { useRef } from 'react';
// import { STATUS_CODE } from '../utils/dictionary.enum';
import { MARKETING_TYPES } from '@/pages/utils/dictionary.enum';
import { paginationProps } from '../utils/utils';

import FormModal from '@/components/Marketing/FormModal';
// import { useApplicationContext } from '@/contexts/application.context';
import { useGlobalContext } from '@/contexts/global.context';
import { confirmDelete } from '@/global';
import { deleteMarket, listMarket } from '@/services/api/marketing';

export type MarketingItem = {
  id: string;
  appName: string;
  status: string;
  type: string;
  createdTime: string;
  action: string;
  name: string;
  apps: any[];
  marketSplashAd: {
    id: string;
    url: string;
    buttonName: string;
    remarks: string;
    imageInfo: {
      [key: string]: any;
    };
  };
  marketAds: {
    id: string;
    url: string;
    imageInfo: {
      [key: string]: any;
    };
  }[];
  marketVideo: {
    id: string;
    title: string;
    url: string;
    remarks: string;
    videoInfo: {
      [key: string]: any;
    };
  };
};

const Marketing: FC = () => {
  const tableRef = useRef<ActionType>();
  const intl = useIntl();
  const { appMessage } = useGlobalContext();
  const [showAdd, setShowAdd] = useState(false);
  const [currentRow, setCurrentRow] = useState<MarketingItem | null>(null);
  // const { handleGetCurrentAppSubscription } = useApplicationContext();

  const handleDelete = async (ids: string[]) => {
    try {
      await deleteMarket({ entityIds: [...ids] });
      message.success(intl.formatMessage({ id: 'notification.marketing.deleted' }));
      tableRef?.current?.reloadAndRest?.();
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
  };

  const columns: ProColumns<MarketingItem>[] = [
    {
      title: intl.formatMessage({ id: 'pages.marketing.marketing-name' }),
      dataIndex: 'name',
    },
    {
      title: intl.formatMessage({ id: 'pages.app.appName' }),
      dataIndex: 'apps',
      render: (text, record) => record.apps.map((x) => x.name).join(', '),
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.common.types' }),
      dataIndex: 'type',
      initialValue: MARKETING_TYPES.ALL,
      valueEnum: {
        [MARKETING_TYPES.ALL]: intl.formatMessage({ id: 'dropdown.select.all' }),
        [MARKETING_TYPES.BANNER]: intl.formatMessage({ id: 'pages.marketing.banner' }),
        [MARKETING_TYPES.SPLASH]: intl.formatMessage({ id: 'pages.marketing.splash' }),
        [MARKETING_TYPES.VIDEO]: intl.formatMessage({ id: 'pages.marketing.video' }),
      },
    },
    // {
    //   title: intl.formatMessage({ id: 'pages.common.status' }),
    //   dataIndex: 'status',
    //   initialValue: STATUS_CODE.ALL,
    //   valueEnum: {
    //     [STATUS_CODE.ALL]: intl.formatMessage({ id: 'dropdown.select.all' }),
    //     [STATUS_CODE.ENABLE]: intl.formatMessage({ id: 'dropdown.select.enable' }),
    //     [STATUS_CODE.DISABLE]: intl.formatMessage({ id: 'dropdown.select.disable' }),
    //   },
    //   render: (text, record) => {
    //     type ColorMap = {
    //       [key: string]: string;
    //     };
    //     const colorMap: ColorMap = {
    //       Enable: 'success',
    //       Disable: 'danger',
    //     };
    //     return <Typography.Text type={colorMap[record.status] as any}>{text}</Typography.Text>;
    //   },
    // },
    {
      title: intl.formatMessage({ id: 'pages.common.createdDate' }),
      dataIndex: 'createdTime',
      search: false,
    },

    {
      title: intl.formatMessage({ id: 'pages.common.action' }),
      key: 'option',
      valueType: 'option',
      width: '150px',
      render: (dom, record) => {
        return (
          <Space split={<Divider type="vertical" />}>
            <Typography.Link
              onClick={() => {
                setCurrentRow(record);
                setShowAdd(true);
              }}
            >
              {intl.formatMessage({ id: 'button.edit' })}
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                confirmDelete({
                  title: intl.formatMessage({ id: 'message.confirm.delete-marketing' }),
                  okText: intl.formatMessage({ id: 'button.delete' }),
                  okButtonProps: { danger: true },
                  onOk: () => handleDelete([record.id]),
                });
              }}
            >
              {intl.formatMessage({ id: 'pages.common.delete' })}
            </Typography.Link>
          </Space>
        );
      },
    },
  ];

  const fetchList = async (values: any) => {
    const { pageSize: size, current: page, name, apps, type /*status*/ } = values;
    const filter: any = {
      size,
      page: page - 1,
      marketName: name,
      appName: apps,
      type,
      // status,
    };
    console.log(values);
    try {
      const { data } = await listMarket(filter);
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

  // useEffect(() => {
  //   const fetchAppSubscription = async () => {
  //     try {
  //       await handleGetCurrentAppSubscription();
  //     } catch (error) {
  //       appMessage({ type: 'error', apiResponse: error });
  //     }
  //   };
  //   fetchAppSubscription();
  // }, []);

  return (
    <>
      <ProTable<MarketingItem>
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
        columns={columns}
        options={false}
        pagination={paginationProps}
        request={fetchList}
        toolBarRender={() => [
          <Button
            key="upload"
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => setShowAdd(true)}
          >
            {intl.formatMessage({ id: 'pages.marketing.add-marketing' })}
          </Button>,
        ]}
      />
      <FormModal
        visible={showAdd}
        currentRow={currentRow}
        onOpenChange={setShowAdd}
        close={() => {
          setCurrentRow(null);
          setShowAdd(false);
        }}
        refreshTable={() => tableRef?.current?.reloadAndRest?.()}
      />
    </>
  );
};

export default Marketing;
