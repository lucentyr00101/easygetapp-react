import { getLocale } from '@umijs/max';
import { Tree } from 'antd';
import { DataNode, TreeProps } from 'antd/es/tree';
import { useEffect, useState } from 'react';

interface GeneralPermissionConfigProps {
  generalPermissionData: any;
  selectedRoleCheckedKeys: any;
  onGeneralPermissionChangeHandler: (
    checkedKeys: string[],
    halfCheckedKeys: string[],
    isClickCheckedKeyValue: boolean,
  ) => void;
}

const GeneralPermissionConfiguration: React.FC<GeneralPermissionConfigProps> = ({
  generalPermissionData,
  selectedRoleCheckedKeys,
  onGeneralPermissionChangeHandler,
}) => {
  const selectedLang = getLocale();
  const [checkedKeys, setCheckedKeys] = useState([]);

  const convertGeneralPermissionData = (permissionList: any) => {
    return permissionList.map((permission: any) => {
      const permissionName = permission && JSON.parse(permission.name);
      return {
        ...permission,
        title: permissionName[selectedLang],
        key: permission.id,
        children: permission.children
          ? convertGeneralPermissionData(permission.children)
          : undefined,
      };
    });
  };

  const newConvertGeneralPermissionData: DataNode[] =
    convertGeneralPermissionData(generalPermissionData);

  const onCheck: TreeProps['onCheck'] = (_checkedKeys: any, { halfCheckedKeys }: any) => {
    setCheckedKeys(_checkedKeys);
    onGeneralPermissionChangeHandler(_checkedKeys, halfCheckedKeys, true);
  };

  useEffect(() => {
    setCheckedKeys(selectedRoleCheckedKeys);
  }, [selectedRoleCheckedKeys]);

  return (
    <Tree
      checkedKeys={[...checkedKeys]}
      checkable
      onCheck={onCheck}
      treeData={newConvertGeneralPermissionData}
    />
  );
};

export default GeneralPermissionConfiguration;
