// import { ProColumns, ProTable } from '@ant-design/pro-components';
// import { Card, Tag } from 'antd';

import InstallationDescriptions from './InstallationDescriptions';

// import { useApplicationContext } from '@/contexts/application.context';
// import { convertFileSize, statusColorMap } from '@/global';
// import { APP_STATUS_CODE } from '@/pages/utils/dictionary.enum';
// import { useIntl } from '@umijs/max';
// import { paginationProps } from '../../utils/utils';
// import type { TableListItem } from './data';

const App: React.FC = () => {
  // const intl = useIntl();
  // const { currentApp } = useApplicationContext();

  // const columns: ProColumns<TableListItem>[] = [
  //   {
  //     title: intl.formatMessage({ id: 'pages.app.version-list.version' }),
  //     dataIndex: 'versionNumber',
  //     search: false,
  //   },
  //   {
  //     title: 'Build',
  //     dataIndex: 'buildNumber',
  //     search: false,
  //   },
  //   {
  //     title: 'OS',
  //     dataIndex: 'operatingSystem',
  //     search: false,
  //   },
  //   {
  //     title: intl.formatMessage({ id: 'pages.app.size' }),
  //     dataIndex: ['appFile', 'fileSizeKb'],
  //     search: false,
  //     render: (text) => (text === '-' ? text : convertFileSize(text as number)),
  //   },
  //   {
  //     title: intl.formatMessage({ id: 'pages.app.downloads' }),
  //     dataIndex: 'downloadCount',
  //     search: false,
  //     render: (text) => (text === '-' ? 0 : text),
  //   },
  //   {
  //     title: intl.formatMessage({ id: 'pages.app.created-time' }),
  //     dataIndex: 'createdTime',
  //     search: false,
  //   },
  //   {
  //     title: intl.formatMessage({ id: 'pages.app.status' }),
  //     dataIndex: 'versionStatus',
  //     search: false,
  //     valueEnum: {
  //       [APP_STATUS_CODE.ALL]: intl.formatMessage({ id: 'dropdown.select.all' }),
  //       [APP_STATUS_CODE.PUBLISH]: intl.formatMessage({ id: 'dropdown.select.publish' }),
  //       [APP_STATUS_CODE.ARCHIVE]: intl.formatMessage({ id: 'dropdown.select.archive' }),
  //       [APP_STATUS_CODE.EXPIRED]: intl.formatMessage({ id: 'dropdown.select.expired' }),
  //       [APP_STATUS_CODE.INVALID]: intl.formatMessage({ id: 'dropdown.select.invalid' }),
  //     },
  //     render: (text, record) => <Tag color={statusColorMap(record?.versionStatus)}>{text}</Tag>,
  //   },
  // ];

  // ## Integration API ##
  // const handleFetchVersionList = async (values: any, sort: any) => {
  //   // API get versionList data (const response = await getVersionList())
  //   // return response
  // };

  return (
    <>
      <InstallationDescriptions />
      {/* <Card style={{ marginTop: '2rem' }}>
        <ProTable<TableListItem>
          headerTitle={intl.formatMessage({ id: 'pages.app.version-list' })}
          columns={columns}
          search={false}
          options={false}
          dataSource={currentApp.previousVersions}
          pagination={paginationProps}
          rowKey="key"
          // rowSelection={{}}
          // request={handleFetchVersionList}
        ></ProTable>
      </Card> */}
    </>
  );
};

export default App;
