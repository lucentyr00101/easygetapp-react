import { getSysPermissionTree } from '@/services/api/permission';
import { sysUserGeneralPermission } from '@/services/api/user-settings';
import { useAccess } from '@umijs/max';
import { Modal, Tabs, TabsProps } from 'antd';
import { useState } from 'react';
import AppPermissionConfiguration from './AppPermissionConfiguration';
import { SelectedUserNameGeneralPermissionItem } from './data';
import GeneralPermissionConfiguration from './GeneralPermissionConfiguration';

import { useGlobalContext } from '@/contexts/global.context';

const ConfigAccessModal: React.FC<{
  visible: boolean;
  onVisibleChange: React.Dispatch<React.SetStateAction<boolean>>;
  selectedUserNameGeneralPermissionValues: SelectedUserNameGeneralPermissionItem;
  onSubmit: () => void;
}> = (props) => {
  const { appMessage } = useGlobalContext();
  const { visible, onVisibleChange, selectedUserNameGeneralPermissionValues, onSubmit } = props;
  const access: any = useAccess();

  const defaultTabKey =
    access?.UserSettings?.children?.AccessConfiguration?.children?.AppPermission?.access !==
    undefined
      ? 'appPermission'
      : access?.UserSettings?.children?.AccessConfiguration?.children?.GeneralPermission?.access !==
        undefined
      ? 'generalPermission'
      : '';
  // console.log('defaultTabKey', defaultTabKey);

  const [tabKey, setTabKey] = useState(defaultTabKey);
  const [sysPermissionGeneralValue, setSysPermissionGeneralValue] = useState([]);
  const [sysPermissionGeneralCheckedKeys, setSysPermissionGeneralCheckedKeys] = useState<string[]>(
    [],
  );
  const [sysPermissionGeneralHalfCheckedKeys, setSysPermissionGeneralHalfCheckedKeys] = useState<
    string[]
  >([]);
  const [isClickCheckedKeyValue, setIsClickCheckedKeyValue] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFetchSysPermissionGeneralTree = async () => {
    try {
      const params = { permissionGroupType: 'General' };
      const data = await getSysPermissionTree(params);
      setSysPermissionGeneralValue(data.data);
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
  };

  const generalPermissionChangeHandler = (
    checkedKeys: string[],
    halfCheckedKeys: string[],
    isClickCheckedKeyValue = false,
  ) => {
    setSysPermissionGeneralCheckedKeys(checkedKeys);
    setSysPermissionGeneralHalfCheckedKeys(halfCheckedKeys);
    setIsClickCheckedKeyValue(isClickCheckedKeyValue);
  };

  const items: TabsProps['items'] = [
    {
      key: 'appPermission',
      label: '应用权限',
      children: <AppPermissionConfiguration></AppPermissionConfiguration>,
      disabled:
        access?.UserSettings?.children?.AccessConfiguration?.children?.AppPermission?.access !==
        undefined
          ? !access?.UserSettings?.children?.AccessConfiguration?.children?.AppPermission?.access
          : true,
    },
    {
      key: 'generalPermission',
      label: '通用权限',
      children: (
        <GeneralPermissionConfiguration
          generalPermissionData={sysPermissionGeneralValue}
          selectedRoleCheckedKeys={selectedUserNameGeneralPermissionValues.generalPermissions}
          onGeneralPermissionChangeHandler={generalPermissionChangeHandler}
        ></GeneralPermissionConfiguration>
      ),
      disabled:
        access?.UserSettings?.children?.AccessConfiguration?.children?.GeneralPermission?.access !==
        undefined
          ? !access?.UserSettings?.children?.AccessConfiguration?.children?.GeneralPermission
              ?.access
          : true,
    },
  ];

  const handleOk = async () => {
    if (tabKey === 'generalPermission') {
      try {
        const data = await sysUserGeneralPermission({
          username: selectedUserNameGeneralPermissionValues.username,
          sysPermissions: isClickCheckedKeyValue
            ? sysPermissionGeneralCheckedKeys
            : selectedUserNameGeneralPermissionValues.generalPermissions,
          sysPermissionChecks: isClickCheckedKeyValue
            ? sysPermissionGeneralHalfCheckedKeys
            : selectedUserNameGeneralPermissionValues.generalPermissionsChecks,
        });
        if (data.success) {
          onSubmit();
        }
      } catch (error: any) {
        appMessage({ type: 'error', apiResponse: error });
      }
    }
  };

  // useEffect(() => {
  //   handleFetchSysPermissionGeneralTree();
  // }, []);

  return (
    <Modal
      open={visible}
      onCancel={() => {
        onVisibleChange(false);
      }}
      title="设置权限"
      onOk={handleOk}
    >
      <Tabs
        defaultActiveKey={defaultTabKey}
        items={items}
        onChange={(key: string) => setTabKey(key)}
      />
    </Modal>
  );
};

export default ConfigAccessModal;
