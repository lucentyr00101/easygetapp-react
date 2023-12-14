import { fetchTimezones, updateTimezone } from '@/services/ant-design-pro/api';
import { DownOutlined } from '@ant-design/icons';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { useIntl, useModel } from '@umijs/max';
import { Dropdown, message, Space } from 'antd';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

const Timezone: FC = () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [timezoneList, setTimezoneList] = useState([]);

  const getTimezones = async () => {
    try {
      const payload = {
        language: 'English',
      };
      const { data } = await fetchTimezones(payload);
      const _data = data?.data?.map((timezone: any) => {
        const { id, code } = timezone;
        return {
          label: code,
          key: id,
        };
      });
      setTimezoneList(_data);
    } catch (e) {
      console.log(e);
    }
  };

  const actionClassName = useEmotionCss(({ token }) => {
    return {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  const handleMenuClick = async (obj: any) => {
    try {
      const payload = {
        id: currentUser?.id as string,
        sysTimezoneId: obj.key,
      };
      await updateTimezone(payload);
      window.location.reload();
    } catch (e: any) {
      message.error(
        e?.response?.data?.message || intl.formatMessage({ id: 'something-went-wrong' }),
      );
      console.log(e);
    }
  };

  useEffect(() => {
    getTimezones();
  }, []);

  return (
    <Dropdown
      menu={{
        items: timezoneList,
        onClick: async (v) => handleMenuClick(v),
        style: { maxHeight: '250px', overflowY: 'auto' },
      }}
    >
      <span className={actionClassName}>
        <Space>
          {currentUser?.sysTimezone?.code}
          <DownOutlined />
        </Space>
      </span>
    </Dropdown>
  );
};

export default Timezone;
