import TagSelect from '@/components/TagSelect';
import {
  fetchSysTemplateSearch,
  templateDelete,
  templateDownload,
  templatePreview,
} from '@/services/api/template-management';
import { PlusCircleOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { useAccess, useIntl } from '@umijs/max';
import { Button, Card, Divider, Input, Space, Typography } from 'antd';
import { useRef, useState } from 'react';
import { Pagination, paginationProps } from '../utils/utils';
import AddEditTemplateModal from './AddEditTemplateModal';
import { TemplateManagementTableListItem } from './data';

import { useGlobalContext } from '@/contexts/global.context';
import { confirmDelete } from '@/global';

const TemplateManagement: React.FC = () => {
  const { appMessage } = useGlobalContext();
  const intl = useIntl();
  const access: any = useAccess();
  const tableRef = useRef<ActionType>();
  const [websiteTitles, setWebsiteTitles] = useState<string | number | any>([]);
  const [templateKeywords, setTemplateKeywords] = useState<string | any>('');
  const [currentRow, setCurrentRow] = useState<TemplateManagementTableListItem>();
  const [addEditTemplateModalVisible, setAddEditTemplateModalVisible] = useState<boolean>(false);

  const handleFetchSysUserList = async (values: any): Promise<any> => {
    // console.log(values);
    const { pageSize: size, current: page } = values;
    const filter: any = { size, page: page - 1, keyword: templateKeywords };
    try {
      const { data } = await fetchSysTemplateSearch(filter);
      return Promise.resolve({
        data: data?.data,
        success: true,
        totalPages: data?.totalPages,
        total: data?.totalElements,
      });
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
      return error;
    }
  };

  const handleTemplatePreview = async (value: any) => {
    try {
      const response: any = await templatePreview({ id: value.id });
      if (response.success) {
        window.open(response?.data, '_blank');
        // appMessage({ type: 'success', localesId: 'success' });
      }
      return response;
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
      return error?.response;
    }
  };

  const handleTemplateDownload = async (value: any) => {
    try {
      const response: any = await templateDownload({ id: value.id }, { responseType: 'blob' });
      const fileURL = window.URL.createObjectURL(response),
        fileLink = document.createElement('a');
      fileLink.href = fileURL;
      fileLink.setAttribute(
        'download',
        `template_${value?.name ? `${value.name}_` : ''}${Date.now()}.zip`,
      );
      fileLink.click();
      // appMessage({ type: 'success', localesId: 'success' });
      return response;
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
      return error?.response;
    }
  };

  const handleTemplateDelete = async (value: any) => {
    try {
      const response: any = await templateDelete({ id: value.id });
      if (response.success) {
        appMessage({ type: 'success', localesId: 'message.success.delete-template' });
        tableRef?.current?.reloadAndRest?.();
      }
      return response;
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
      return error?.response;
    }
  };

  const columns: ProColumns<TemplateManagementTableListItem>[] = [
    {
      title: intl.formatMessage({ id: 'pages.template-config.template-name' }),
      dataIndex: 'name',
    },
    {
      // hideInTable: !access?.TemplateManagement?.children?.Preview?.access,
      title: intl.formatMessage({ id: 'pages.template-config.display-effect' }),
      dataIndex: 'displayEffect',
      search: false,
      render: (_, entity: any) => {
        return (
          <Typography.Link
            onClick={() => {
              handleTemplatePreview(entity);
            }}
            disabled={!access?.TemplateManagement?.children?.Preview?.access}
          >
            {intl.formatMessage({ id: 'button.preview' })}
          </Typography.Link>
        );
      },
    },
    // {
    //   title: intl.formatMessage({ id: 'pages.template-config.template-grouping' }),
    //   dataIndex: 'templateGrouping',
    //   search: false,
    // },
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
              accessible={!!access?.TemplateManagement?.children?.Edit?.access}
              fallback={
                <Typography.Link
                  disabled
                  onClick={() => {
                    setCurrentRow(entity);
                    setAddEditTemplateModalVisible(true);
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
                if (!!access?.TemplateManagement?.children?.Edit?.access) {
                  setCurrentRow(entity);
                  setAddEditTemplateModalVisible(true);
                }
              }}
              disabled={!access?.TemplateManagement?.children?.Edit?.access}
            >
              {intl.formatMessage({ id: 'button.edit' })}
            </Typography.Link>
            {/* </Access> */}
            {/* <Access
              key="resetGACode"
              accessible={!!access?.TemplateManagement?.children?.ResetGACode?.access}
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
                handleTemplateDownload(entity);
              }}
              disabled={!access?.TemplateManagement?.children?.Download?.access}
            >
              {intl.formatMessage({ id: 'button.download' })}
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                confirmDelete({
                  title: intl.formatMessage({ id: 'message.confirm.delete-template' }),
                  okText: intl.formatMessage({ id: 'button.delete' }),
                  okButtonProps: { danger: true },
                  onOk: () => handleTemplateDelete(entity),
                });
              }}
              disabled={!access?.TemplateManagement?.children?.Delete?.access}
            >
              {intl.formatMessage({ id: 'button.delete' })}
            </Typography.Link>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      {/* Filter Bar */}
      <Card bordered={false} style={{ marginBottom: '16px' }}>
        <TagSelect
          value={websiteTitles}
          onChange={(value) => {
            setWebsiteTitles(value);
            tableRef?.current?.reloadAndRest?.();
          }}
          label={intl.formatMessage({ id: 'pages.template-management.website-title' })}
          actionsText={{
            selectAllText: intl.formatMessage({
              id: 'pages.template-management.website-title.all',
            }),
          }}
          expandable
        >
          {/* <TagSelect.Option value="cat1">类目一</TagSelect.Option>
          <TagSelect.Option value="cat2">类目二</TagSelect.Option>
          <TagSelect.Option value="cat3">类目三</TagSelect.Option>
          <TagSelect.Option value="cat4">类目四</TagSelect.Option>
          <TagSelect.Option value="cat5">类目五</TagSelect.Option>
          <TagSelect.Option value="cat6">类目六</TagSelect.Option>
          <TagSelect.Option value="cat7">类目七</TagSelect.Option>
          <TagSelect.Option value="cat8">类目八</TagSelect.Option>
          <TagSelect.Option value="cat9">类目九</TagSelect.Option>
          <TagSelect.Option value="cat10">类目十</TagSelect.Option>
          <TagSelect.Option value="cat11">类目十一</TagSelect.Option>
          <TagSelect.Option value="cat12">类目十二</TagSelect.Option> */}
        </TagSelect>
        <Divider />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px' }}>
            {intl.formatMessage({ id: 'pages.template-management.search-template.keywords' })}
          </span>
          <Input
            value={templateKeywords}
            onChange={(event) => {
              setTemplateKeywords(event?.target?.value);
            }}
            style={{ maxWidth: '400px' }}
          />
          <Button
            key="submit"
            type="primary"
            style={{ margin: '0 10px' }}
            onClick={() => tableRef?.current?.reloadAndRest?.()}
          >
            {intl.formatMessage({ id: 'button.search' })}
          </Button>
          <Button
            key="cancel"
            onClick={() => {
              setTemplateKeywords('');
              tableRef?.current?.reloadAndRest?.();
            }}
          >
            {intl.formatMessage({ id: 'button.reset' })}
          </Button>
        </div>
      </Card>
      {/* /Filter Bar */}
      <ProTable<TemplateManagementTableListItem, Pagination>
        rowKey="id"
        search={false}
        // search={{
        //   labelWidth: 'auto',
        //   optionRender(searchConfig, formProps: any) {
        //     return [
        //       <Button key="rest" onClick={() => formProps?.form?.resetFields?.()}>
        //         {searchConfig.resetText}
        //       </Button>,
        //       <Button
        //         key="submit"
        //         type="primary"
        //         onClick={() => formProps?.form?.submit?.()}
        //         {...formProps?.submitter?.props?.submitButtonProps}
        //       >
        //         {searchConfig.searchText}
        //       </Button>,
        //     ];
        //   },
        // }}
        headerTitle={intl.formatMessage({ id: 'menu.template-management' })}
        actionRef={tableRef}
        columns={columns}
        pagination={paginationProps}
        request={handleFetchSysUserList}
        options={false}
        toolBarRender={() => [
          // <Access
          //   key="upload"
          //   accessible={!!access?.TemplateManagement?.children?.AddNewTemplate?.access}
          // >
          <Button
            key="upload"
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => {
              if (!!access?.TemplateManagement?.children?.AddNewTemplate?.access) {
                setAddEditTemplateModalVisible(true);
              }
            }}
            disabled={!access?.TemplateManagement?.children?.AddNewTemplate?.access}
          >
            {intl.formatMessage({ id: 'button.add-new-template' })}
          </Button>,
          // </Access>,
        ]}
      ></ProTable>
      <AddEditTemplateModal
        currentRow={currentRow}
        visible={addEditTemplateModalVisible}
        onVisibleChange={setAddEditTemplateModalVisible}
        onSubmit={() => {
          setAddEditTemplateModalVisible(false);
          setCurrentRow(undefined);
          tableRef?.current?.reloadAndRest?.();
        }}
        close={() => {
          setAddEditTemplateModalVisible(false);
          setCurrentRow(undefined);
        }}
      ></AddEditTemplateModal>
    </>
  );
};

export default TemplateManagement;
