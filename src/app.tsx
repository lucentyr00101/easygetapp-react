import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { LinkOutlined } from '@ant-design/icons';
import { PageContainer, Settings as LayoutSettings } from '@ant-design/pro-components';
import { history, Link, RunTimeLayoutConfig, useIntl } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import router from '../config/routes';
import type { TabType } from './app-data.d';
import { ApplicationProvider } from './contexts/application.context';
import { DropdownProvider } from './contexts/dropdown.context';
import { GlobalProvider } from './contexts/global.context';
// import MenuHeaderContent from './components/MenuHeaderContent';
import { errorConfig } from './requestErrorConfig';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */

const marketingRoute = {
  path: '/marketing',
  name: 'marketing',
  children: [],
  locale: 'menu.marketing',
};

const toKebabCase = (str: string) => {
  const x = str.match(
    /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g,
  ) as unknown as any;
  return x.map((x: any) => x.toLowerCase()).join('-');
};

const generateMenu = (permissions: any) => {
  const menuNames = ['directory', 'menu', 'submenu'];
  const menu = permissions.reduce((acc: any, permission: any) => {
    const { pageUrl, title, resourceType } = permission;
    if (menuNames.includes(resourceType.toLowerCase())) {
      const data = {
        path: pageUrl,
        name: title.toLowerCase(),
        children: generateMenu(permission.children),
        locale: `menu.${toKebabCase(title)}`,
      };
      acc.push(data);
    }
    return acc;
  }, []);
  return menu;
};

export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  tabList: Array<TabType>;
  tabActiveKey?: string;
  fetchUserInfo?: () => Promise<any>;
  fetchRoutes?: (currentUser: any) => any;
}> {
  const { location } = history;
  const fetchUserInfo = async () => {
    try {
      const { data } = await queryCurrentUser({
        skipErrorHandler: true,
        params: {
          v: Date.now(),
        },
      });
      return data;
    } catch (e: any) {
      // console.log(e);
      throw e?.response?.data;
    }
  };
  const fetchRoutes = (currentUser: any = undefined) => {
    return currentUser?.roles
      ? [
          ...generateMenu(currentUser?.roles.map((x: any) => x.sysResourceResponse).flat()),
          marketingRoute,
        ]
      : undefined;
  };
  // 如果不是登录页面，执行
  const publicRoutes = ['/download'];
  const isPublic = publicRoutes.some((v) => location.pathname.includes(v));
  if (location.pathname !== loginPath && !isPublic) {
    const currentUser = await fetchUserInfo();
    const appTabList = window.localStorage.getItem('appTabList');
    return {
      fetchUserInfo,
      fetchRoutes,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
      tabList: appTabList ? JSON.parse(appTabList) : [],
    };
  }
  return {
    fetchUserInfo,
    fetchRoutes,
    settings: defaultSettings as Partial<LayoutSettings>,
    tabList: [],
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  let routeName: TabType = { tab: '', key: '', path: '' };
  const { fetchRoutes, currentUser, tabList } = initialState || {};
  if (currentUser?.id) {
    // Save And Remove App Tab List To Local Storage
    window.localStorage.setItem('appTabList', JSON.stringify(tabList));
  } else {
    window.localStorage.removeItem('appTabList');
  }
  const routes: any = fetchRoutes?.(currentUser);
  const getRouteDetails = (routeList: any, pathname: string) => {
    routeList.forEach((route: any) => {
      if (route.routes && route.routes.length > 0) {
        getRouteDetails(route.routes, pathname);
      } else if (
        route.name !== undefined &&
        route.redirect === undefined &&
        (route.path === pathname || route.path === String(pathname).split(/\?/)?.[0])
      ) {
        routeName = {
          tab: route.name,
          key: pathname,
          path: pathname,
        };
      }
    });
  };

  const checkPathnameIsInTabList = (pathname: string) => {
    if (tabList) {
      const found = tabList.some((tab: TabType) => tab.path === pathname);
      if (!found) {
        getRouteDetails(router, pathname);
        if (
          initialState?.currentUser?.id &&
          !(routeName.tab === '' && routeName.key === '' && routeName.path === '') &&
          routeName.path === pathname
        ) {
          tabList.push(routeName);
        }
      }
    }
  };

  const remove = (e: any, action: any) => {
    if (action === 'remove' && tabList) {
      const filterTabList = tabList.filter((value: any) => value.path !== e);
      const currentTabPaneIndex = tabList.findIndex((value: any) => value.path === e);
      setInitialState((s) => ({ ...s, tabList: filterTabList }));
      if (tabList && tabList.length > 1) {
        if (e === `${history?.location?.pathname}${history?.location?.search}`) {
          history.push(
            filterTabList?.[currentTabPaneIndex - 1 > -1 ? currentTabPaneIndex - 1 : 0]?.path,
          );
        }
      } else {
        history.push(routes?.[0]?.path);
      }
    }
  };

  // function mergeObjects(obj1: any, obj2: any) {
  //   for (const key in obj2) {
  //     if (obj2.hasOwnProperty(key)) {
  //       if (
  //         obj1[key] !== undefined &&
  //         typeof obj1[key] === 'object' &&
  //         typeof obj2[key] === 'object'
  //       ) {
  //         obj1[key] = mergeObjects(obj1[key], obj2[key]);
  //       } else {
  //         obj1[key] = obj2[key];
  //       }
  //     }
  //   }
  //   return obj1;
  // }

  // function deepMergeDuplicates(arr: any, prop: any) {
  //   const groups = {};

  //   arr.forEach((item: any) => {
  //     const propValue = item[prop];

  //     if (!propValue) {
  //       groups[null] = groups[null] || [];
  //       groups[null].push(item);
  //     } else {
  //       groups[propValue] = groups[propValue] || [];
  //       groups[propValue].push(item);
  //     }
  //   });

  //   const mergedArray = Object.values(groups).map((group) => {
  //     return group.reduce((merged, obj) => mergeObjects(merged, obj), {});
  //   });

  //   return mergedArray.sort((a, b) => a[prop] - b[prop]);
  // }

  // const fetchMenuData = () => {
  //   const { currentUser } = initialState || {};
  //   const { roles } = currentUser || {};
  //   // console.log({ initialState });
  //   const flatPermissions =
  //     roles?.length > 1
  //       ? roles
  //           ?.filter((x: any) => x?.name.toLowerCase() !== 'own data')
  //           ?.map((x: any) => x?.sysResourceResponse)
  //           .flat() || []
  //       : roles?.map((x: any) => x?.sysResourceResponse).flat() || [];
  //   const permissions = deepMergeDuplicates(flatPermissions, 'id');
  //   const roleNamesArray = currentUser?.roles?.map((x: any) => x.name.toLowerCase()) || [];
  //   const isSystemAdmin = roleNamesArray.some((x: string) => x.includes(SYSTEM_ADMIN));
  //   return [...generateMenu(permissions), ...(isSystemAdmin ? [marketingRoute] : [])];
  // };

  const generateMenuData = (menuData: any[]) => {
    const { currentUser } = initialState || {};
    let newMenuData: any[] = [];
    currentUser?.mergedRolesPermissions?.forEach((valueA: any) => {
      newMenuData = [
        ...newMenuData,
        menuData?.find(
          (valueB: any) => toKebabCase(valueB?.access) === toKebabCase(valueA?.componentName),
        ),
      ];
    });
    newMenuData = [
      ...newMenuData,
      ...menuData.filter((value: any) => !value.access || /^Marketing$/g.test(value.access)),
    ];
    return newMenuData;
  };

  return {
    rightContentRender: () => <RightContent />,
    waterMarkProps: {
      // content: initialState?.currentUser?.name,
    },
    menuDataRender: generateMenuData,
    footerRender: () => <Footer />,
    onPageChange: async () => {
      const { location } = history;
      const routeList = routes?.map((item: any) => item?.path) || [];
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser?.id && location.pathname !== loginPath) {
        history.push(loginPath);
        const currentState = await getInitialState();
        setInitialState((s: any) => ({ ...s, ...currentState }));
      } else if (initialState?.currentUser?.id && location.pathname === loginPath) {
        history.push(routes?.[0]?.path);
      } else if (
        initialState?.currentUser?.id &&
        routeList?.length > 0 &&
        routeList?.indexOf(location.pathname) === -1
      ) {
        history.push(routes?.[0]?.path);
      }
    },
    layoutBgImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: () => undefined,
    // menuHeaderRender: () => <MenuHeaderContent></MenuHeaderContent>,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      const { location } = history;
      // Check Tab List(Array) includes current pathname
      // If None, push current pathname into Tab List (Array)
      checkPathnameIsInTabList(location.pathname + location.search);
      // Translate Tab List (Array) Name according Language
      setTimeout(() => {
        setInitialState((s: any) => ({ ...s, tabActiveKey: location.pathname + location.search }));
      }, 100);

      const convertedTabList =
        tabList &&
        tabList.map((value: TabType) => {
          if (!value.skipTranslate) {
            return {
              ...value,
              tab: useIntl().formatMessage({
                id: `menu.${toKebabCase(value.tab as string)}`,
              }),
            };
          }

          return value;
        });

      // if (initialState?.loading) return <PageLoading />;

      return (
        <>
          {location?.pathname?.includes('/login') ? (
            <>{children}</>
          ) : (
            <GlobalProvider>
              <DropdownProvider>
                <ApplicationProvider>
                  <PageContainer
                    className="TabPageContainer"
                    title={false}
                    breadcrumb={{}}
                    tabList={convertedTabList}
                    tabProps={{
                      type: 'editable-card',
                      hideAdd: true,
                      onEdit: (e, action) => remove(e, action),
                    }}
                    tabActiveKey={location.pathname + location.search}
                    onTabChange={(e) => history.push(e)}
                  >
                    {children}
                  </PageContainer>
                </ApplicationProvider>
              </DropdownProvider>
            </GlobalProvider>
          )}
          {/* <SettingDrawer
            disableUrlParams
            enableDarkTheme
            settings={initialState?.settings}
            onSettingChange={(settings) => {
              setInitialState((preInitialState: any) => ({
                ...preInitialState,
                settings,
              }));
            }}
          /> */}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  baseURL: EGA_API_URL,
  ...errorConfig,
};
