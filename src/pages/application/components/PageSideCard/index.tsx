import { updateIcon } from '@/services/api/app-management';
import { EditOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Card, Menu, MenuProps, Spin, Upload, UploadProps } from 'antd';
import { useState } from 'react';

import styles from './style.less';

export type PageSideCardType = {
  name: string | boolean;
  avatar: string;
  id: string | number;
  desc?: () => React.ReactNode;
};

type SettingsState = {
  mode: 'inline' | 'horizontal';
  selectKey: string;
};

type MenuItem = Required<MenuProps>['items'][number];

const PageSideCard: React.FC<{
  onChangeMenu?: (menu: string) => void;
  tabMenu?: boolean | false;
  defaultSelectKey?: string;
  menuMapItem?: MenuItem[];
  content: Partial<PageSideCardType>;
  style?: React.CSSProperties;
  extra?: React.ReactNode;
  loading: boolean;
}> = (props) => {
  const {
    content,
    style,
    extra,
    onChangeMenu,
    tabMenu,
    menuMapItem,
    defaultSelectKey = '',
    loading,
  } = props;
  const intl = useIntl();

  const [avatarIcon, setAvatarIcon] = useState(null);
  const [initConfig, setInitConfig] = useState<SettingsState>({
    mode: 'inline',
    selectKey: defaultSelectKey,
  });

  const handleMenuClick = (key: string) => {
    if (onChangeMenu) onChangeMenu(key);
    setInitConfig({
      ...initConfig,
      selectKey: key,
    });
  };
  // const getMenu = () => {
  //   if (menuMapItem) {
  //     return Object.keys(menuMapItem).map((item) => <Item key={item}>{menuMapItem[item]}</Item>);
  //   }
  // };

  const iconOnChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
    const formData = new FormData();
    formData.append(
      'appEditIconParam',
      new Blob([JSON.stringify({ id: content.id })], { type: 'application/json' }),
    );
    if (newFileList.length > 0) {
      formData.append('icon', newFileList[0].originFileObj as any);
    }

    const { data } = await updateIcon(formData);
    setAvatarIcon(data?.fileLink);
    // if (data?.fileLink) {
    //   message.success(intl.formatMessage({ id: 'message.edit-icon.success' }));
    // }
  };

  return (
    <Card>
      <Spin spinning={loading}>
        <div
          className={styles.pageSideCard}
          style={{
            ...style,
          }}
        >
          <div className={styles.avatar}>
            <img src={avatarIcon || content.avatar} width={150} height={150} />
            <Upload
              name="editIcon"
              onChange={iconOnChange}
              beforeUpload={() => false}
              showUploadList={false}
              maxCount={1}
            >
              <Button icon={<EditOutlined />} size="middle" className={styles.icon}>
                {intl.formatMessage({ id: 'button.edit.icon' })}
              </Button>
            </Upload>
          </div>
          <div className={styles.content}>
            {content.name && <div className={styles.contentTitle}>{content.name}</div>}
            {content.desc && <div className={styles.contentDesc}>{content.desc()}</div>}
          </div>
          <div className={styles.extra}>{extra}</div>
        </div>
        {tabMenu && menuMapItem !== undefined && (
          <div className={styles.leftMenu}>
            <Menu
              className={styles.menuMap}
              mode={initConfig.mode}
              selectedKeys={[initConfig.selectKey]}
              onClick={({ key }) => handleMenuClick(key)}
              items={menuMapItem}
            />
          </div>
        )}
      </Spin>
    </Card>
  );
};

export default PageSideCard;
