/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  // const filteredRoles = currentUser?.roles?.length > 1 ? currentUser?.roles?.filter((x: any) => !x.name.toLowerCase().includes('own data')) || [] : currentUser?.roles; // Filter Own Data
  // const generalPermissions = filteredRoles?.map((x: any) => x.sysResourceResponse).flat() || [];
  const roleNamesArray = currentUser?.roles?.map((x: any) => x.name.toLowerCase()) || [];
  const isSystemAdmin = roleNamesArray.some((x: string) => x.includes(SYSTEM_ADMIN));
  const convertGeneralPermissionData = (permissionList: any = []) => {
    const permissionData = permissionList.reduce((prev: any, curr: any) => {
      const name = curr.permissionName.replace(/ +/g, '');
      const access =
        curr?.resourceType === 'Directory'
          ? curr.children?.some(
              (value: any) =>
                value?.resourceType === 'Action' &&
                value?.permissionName === 'View' &&
                value?.status === 'Enable',
            )
          : true;
      return {
        ...prev,
        ...(access
          ? {
              [name]: {
                access,
                ...(curr?.children
                  ? { children: convertGeneralPermissionData(curr.children) }
                  : {}),
              },
            }
          : {}),
      };
    }, {});
    return permissionData;
  };
  const generalPermissionAccess = convertGeneralPermissionData(currentUser?.mergedRolesPermissions);
  return {
    ...generalPermissionAccess,
    ...(isSystemAdmin ? { Marketing: { access: true } } : {}),
  };
}
