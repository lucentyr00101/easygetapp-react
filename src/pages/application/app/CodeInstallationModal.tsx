import { Button, Col, Divider, Modal, Row, Space, Typography } from 'antd';
import { useRef, useState } from 'react';

import { useGlobalContext } from '@/contexts/global.context';
import { downloadFile } from '@/global';
import { deleteCodes, exportCodes, generateCodes, getCodes } from '@/services/api/app-management';
import type { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ActionType, ProForm, ProFormDigit, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { AppDetailItem, CodeInstallationListItem } from './data';

const CodeInstallationModal: React.FC<{
  visible: boolean;
  onVisibleChange: React.Dispatch<React.SetStateAction<boolean>>;
  appDetail: AppDetailItem;
}> = (props) => {
  const { appMessage } = useGlobalContext();
  const intl = useIntl();
  const { visible, onVisibleChange, appDetail } = props;
  const tableRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const handleCopy = (str: string) => {
    navigator.clipboard.writeText(str);
    appMessage({ type: 'success', localesId: 'copied' });
  };

  const handleDelete = async (ids: string[]) => {
    try {
      await deleteCodes({ entityIds: ids });
      appMessage({ type: 'success', localesId: 'success' });
      tableRef?.current?.reloadAndRest?.();
      setSelectedRowKeys([]);
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
  };

  const columns: ProColumns<CodeInstallationListItem>[] = [
    {
      title: intl.formatMessage({ id: 'component.app.code.codes' }),
      dataIndex: 'code',
    },
    {
      title: intl.formatMessage({ id: 'pages.common.status' }),
      dataIndex: 'status',
      valueEnum: {
        Used: intl.formatMessage({ id: 'component.app.code.status.used' }),
        Unused: intl.formatMessage({ id: 'component.app.code.status.unused' }),
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.common.createdTime' }),
      dataIndex: 'createdTime',
    },
    {
      title: intl.formatMessage({ id: 'pages.common.action' }),
      key: 'action',
      valueType: 'option',
      render: (text, record) => {
        return (
          <Space split={<Divider type="vertical" />}>
            <Typography.Link onClick={() => handleCopy(record.code)}>
              {intl.formatMessage({ id: 'pages.common.copy' })}
            </Typography.Link>
            <Typography.Link onClick={() => handleDelete([record.id])}>
              {intl.formatMessage({ id: 'pages.common.delete' })}
            </Typography.Link>
          </Space>
        );
      },
    },
  ];

  const handleGenerate = async (values: any) => {
    setLoading(true);
    try {
      const { noOfCodes } = values;
      const payload = {
        appId: appDetail?.id as string,
        noOfCodes,
      };
      await generateCodes(payload);
      tableRef?.current?.reloadAndRest?.();
      formRef?.current?.resetFields();
      appMessage({ type: 'success', localesId: 'success' });
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
    setLoading(false);
  };

  const fetchList = async () => {
    const filter: any = {
      id: appDetail?.id,
    };
    const { data } = await getCodes(filter);

    return Promise.resolve({
      data,
      success: true,
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await exportCodes({ appId: appDetail?.id as string, language: 'English' });
      const filename = `${appDetail?.name}`;
      downloadFile(res, filename);
      appMessage({ type: 'success', localesId: 'success' });
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
    setLoading(false);
  };

  return (
    <Modal
      title={intl.formatMessage({ id: 'component.app.code.installation-code-details' })}
      open={visible}
      width="650px"
      onCancel={() => onVisibleChange(false)}
      maskClosable={false}
      destroyOnClose={true}
      cancelButtonProps={{
        type: 'primary',
      }}
      cancelText={intl.formatMessage({ id: 'app.settings.close' })}
      okButtonProps={{
        style: {
          display: 'none',
        },
      }}
    >
      <Row gutter={4} justify="space-between">
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            await handleGenerate(values);
          }}
          submitter={{
            submitButtonProps: {
              style: {
                display: 'none',
              },
            },
            resetButtonProps: {
              style: {
                display: 'none',
              },
            },
          }}
        >
          <Row gutter={5}>
            <Col span={18}>
              <ProFormDigit
                name="noOfCodes"
                style={{ width: '100%' }}
                fieldProps={{
                  controls: false,
                }}
                placeholder={intl.formatMessage({ id: 'component.app.code.number-of-codes' })}
              />
            </Col>
            <Col span={4}>
              <Button
                loading={loading}
                htmlType="submit"
                type="primary"
                style={{ marginBottom: 16 }}
              >
                {intl.formatMessage({ id: 'component.app.code.generate' })}
              </Button>
            </Col>
          </Row>
        </ProForm>

        <Col span={10} style={{ textAlign: 'right' }}>
          <Button onClick={() => handleExport()} type="primary" style={{ marginBottom: 16 }}>
            {intl.formatMessage({ id: 'component.app.code.export-codes' })}
          </Button>
        </Col>
      </Row>
      <ProTable<CodeInstallationListItem>
        rowKey="id"
        actionRef={tableRef}
        rowSelection={rowSelection}
        tableAlertOptionRender={({ selectedRowKeys }: any) => {
          return (
            <Typography.Link disabled={loading} onClick={() => handleDelete([...selectedRowKeys])}>
              {intl.formatMessage({ id: 'pages.common.delete' })}
            </Typography.Link>
          );
        }}
        search={false}
        columns={columns}
        options={false}
        pagination={false}
        request={fetchList}
      />
    </Modal>
  );
};

export default CodeInstallationModal;
