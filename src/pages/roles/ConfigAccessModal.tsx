import { fetchRoleConfigList, sysRoleGeneralPermission } from '@/services/api/roles';
import { useIntl, useModel } from '@umijs/max';
import { Modal, Tree, TreeProps } from 'antd';
import { DataNode } from 'antd/es/tree';
import { useEffect, useState } from 'react';
import { RoleSettingsTableListItem } from './data';

import { useGlobalContext } from '@/contexts/global.context';

type Props = {
  visible: boolean;
  onVisibleChange: React.Dispatch<React.SetStateAction<boolean>>;
  currentRow?: RoleSettingsTableListItem;
  onSubmit: () => void;
};

const ConfigAccessModal: React.FC<Props> = (props) => {
  const { appMessage } = useGlobalContext();
  const { visible, onVisibleChange, currentRow, onSubmit } = props;
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  const [permissionList, setPermissionList] = useState<DataNode[]>([]);
  // const [appMngViewKey, setAppMngViewKey] = useState<any>({}); // Application Mng. view action is always checked.
  const [checkedKeys, setCheckedKeys] = useState<DataNode[] | any>([]);
  const [checkedKeysList, setCheckedKeysList] = useState<{
    sysResourceIds: string[];
    sysResourceHalfCheckIds: string[];
  }>({ sysResourceIds: [], sysResourceHalfCheckIds: [] });

  const onCheck: TreeProps['onCheck'] = (checkedKeys: any, info: any) => {
    // console.log('onCheck', checkedKeys, info);
    setCheckedKeys([
      ...checkedKeys,
      // ...(checkedKeys.indexOf(appMngViewKey?.key) === -1 ? [appMngViewKey?.key] : []), // Application Mng. view action is always checked.
    ]);
    setCheckedKeysList({
      sysResourceIds: [...checkedKeys],
      sysResourceHalfCheckIds: [
        ...info?.halfCheckedKeys,
        // ...(info?.checkedNodes.map((item: any) => item.key).indexOf(appMngViewKey?.key) === -1 ? [ appMngViewKey?.parent, appMngViewKey?.key ] : []), // Application Mng. view action is always checked.
        // ...info?.checkedNodes.filter((item: any) => item?.parent && info?.halfCheckedKeys.indexOf(item.parent) === -1 && info?.checkedNodes.map((pItem: any) => pItem?.key).indexOf(item.parent) === -1 && item?.disabled).reduce((accumulator: any, currentValue: any) => [ ...accumulator, ...[ currentValue.parent, currentValue.key ] ], []) // Application Mng. view action is always checked via disabled.
      ],
    });
  };

  const generateSelectTreeList = (list: any[] = [], parent?: string) => {
    let treeList: any[] = [];
    list.forEach((item) => {
      treeList = [
        ...treeList,
        {
          ...(parent ? { parent } : {}),
          ...(item?.permissionName ? { permissionName: item.permissionName } : {}),
          // ...(item.uri === '/appManagement/view' ? { disabled: true } : {}), // Application Mng. view action is always checked via disabled.
          title: intl.formatMessage({
            id: `pages.roles.permissions.${String(item?.permissionName)
              .toLowerCase()
              .replace(/\s/gi, '-')}`,
          }),
          key: item?.id,
          ...(item?.children?.length > 0
            ? { children: generateSelectTreeList(item.children, item?.id) }
            : {}),
        },
      ];
    });
    return treeList;
  };

  const appPermissionData = (list: any[] = []) => {
    const configList: DataNode[] | any = generateSelectTreeList(list);
    // const _appMngViewKey = configList.find((item: any) => item.permissionName === 'App Management') ?.children.find((item: any) => item.permissionName === 'View'); // Application Mng. view action is always checked.
    // setAppMngViewKey(_appMngViewKey); // Application Mng. view action is always checked.
    const checkedList: DataNode[] = [
      ...currentRow?.sysResourceResponse?.map((item: any) => item?.id),
    ];
    const checkedKeysList: any = {
      sysResourceIds: [...currentRow?.sysResourceResponse?.map((item: any) => item?.id)],
      sysResourceHalfCheckIds: [
        ...currentRow?.sysResourceHalfChecksResponse?.map((item: any) => item?.id),
      ],
    };
    setPermissionList(configList);
    setCheckedKeys([
      ...checkedList,
      // ...(checkedList.indexOf(_appMngViewKey?.key) === -1 ? [_appMngViewKey?.key] : []), // Application Mng. view action is always checked.
    ]);
    setCheckedKeysList({
      sysResourceIds: [...checkedKeysList.sysResourceIds],
      sysResourceHalfCheckIds: [
        ...checkedKeysList.sysResourceHalfCheckIds,
        // ...(checkedKeysList.sysResourceIds.indexOf(_appMngViewKey?.key) === -1 && checkedKeysList.sysResourceHalfCheckIds.indexOf(_appMngViewKey?.parent) === -1 ? [ _appMngViewKey?.parent ] : []), // Application Mng. view action is always checked.
      ],
    });
  };

  const getRoleConfigList = async () => {
    try {
      const configList = await fetchRoleConfigList({ applicationId: currentUser?.application?.id });
      appPermissionData(configList?.data);
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
  };

  const handleOk = async () => {
    try {
      const data = await sysRoleGeneralPermission({
        id: currentRow?.id,
        ...checkedKeysList,
      });
      if (data.success) {
        appMessage({ type: 'success', text: intl.formatMessage({ id: 'messages.role.updated' }) });
        onSubmit();
      }
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
  };

  useEffect(() => {
    if (visible) {
      getRoleConfigList();
    } else {
      setCheckedKeys([]);
      setCheckedKeysList({ sysResourceIds: [], sysResourceHalfCheckIds: [] });
    }
  }, [visible]);

  return (
    <Modal
      open={visible}
      width={484}
      onCancel={() => {
        onVisibleChange(false);
      }}
      title={intl.formatMessage({ id: 'pages.roles.permissions-configuration' })}
      okText={intl.formatMessage({ id: 'button.save' })}
      onOk={handleOk}
    >
      <div style={{ margin: '20px 0 0 0', display: 'flex', flexWrap: 'wrap' }}>
        <span>{intl.formatMessage({ id: 'pages.roles.permissions' })}:&nbsp;</span>
        <Tree
          checkable
          expandedKeys={permissionList.map((item: any) => item.key)}
          onCheck={onCheck}
          treeData={permissionList}
          checkedKeys={checkedKeys}
        />
      </div>
    </Modal>
  );
};

export default ConfigAccessModal;
