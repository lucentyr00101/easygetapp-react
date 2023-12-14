import { Form, Select, Tree, TreeProps } from 'antd';
import { DataNode } from 'antd/es/tree';

const AppPermissionConfiguration: React.FC = () => {
  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
  };

  const onCheck: TreeProps['onCheck'] = (checkedKeys, info) => {
    console.log('onCheck', checkedKeys, info);
  };

  const appPermissionData: DataNode[] = [
    {
      title: '应用',
      key: 'app',
      children: [
        {
          title: 'Upload App',
          key: 'upload-app',
        },
        {
          title: 'Enter',
          key: 'enter',
          children: [
            {
              title: 'App Settings',
              key: 'app-settings',
            },
            {
              title: 'App Instructions',
              key: 'app-instructions',
            },
            {
              title: 'Edit',
              key: 'app-enter-edit',
            },
            {
              title: 'Installation Code Details',
              key: 'installation-code-details',
            },
          ],
        },
        {
          title: 'Delete',
          key: 'delete',
        },
      ],
    },
    {
      title: 'Version',
      key: 'version',
      children: [
        {
          title: 'Android',
          key: 'android',
          children: [
            {
              title: 'Add Version',
              key: 'android-add-version',
            },
            {
              title: 'Edit',
              key: 'android-edit',
            },
            {
              title: 'Remove',
              key: 'android-remove',
            },
            {
              title: 'More',
              key: 'android-more',
              children: [
                {
                  title: 'Achieve Version',
                  key: 'android-achieve-version',
                },
                {
                  title: 'Version QR Code',
                  key: 'android-version-qr-code',
                },
                {
                  title: 'Download',
                  key: 'android-download',
                },
                {
                  title: 'Copy Link',
                  key: 'android-copy-link',
                },
              ],
            },
          ],
        },
        {
          title: 'iOS',
          key: 'iOS',
          children: [
            {
              title: 'Add Version',
              key: 'iOS-add-version',
            },
            {
              title: 'Edit',
              key: 'iOS-edit',
            },
            {
              title: 'Remove',
              key: 'iOS-remove',
            },
            {
              title: 'More',
              key: 'iOS-more',
              children: [
                {
                  title: 'Achieve Version',
                  key: 'iOS-achieve-version',
                },
                {
                  title: 'Version QR Code',
                  key: 'iOS-version-qr-code',
                },
                {
                  title: 'Download',
                  key: 'iOS-download',
                },
                {
                  title: 'Copy Link',
                  key: 'iOS-copy-link',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Statistics',
      key: 'statistics',
    },
  ];
  return (
    <>
      <Form layout="vertical">
        <Form.Item name="gender" label="应用" rules={[{ required: true }]}>
          <Select
            defaultValue="testerAndroid"
            options={[{ value: 'testerAndroid', label: 'TesterAndroid' }]}
          />
        </Form.Item>
      </Form>

      <Tree checkable onSelect={onSelect} onCheck={onCheck} treeData={appPermissionData} />
    </>
  );
};

export default AppPermissionConfiguration;
