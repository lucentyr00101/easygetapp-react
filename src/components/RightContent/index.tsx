import Timezone from '@/components/Global/Timezone';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { SelectLang, useModel } from '@umijs/max';
import React from 'react';
import Avatar from './AvatarDropdown';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  const className = useEmotionCss(() => {
    return {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      gap: 8,
    };
  });

  const actionClassName = useEmotionCss(({ token }) => {
    return {
      display: 'flex',
      float: 'right',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      cursor: 'pointer',
      padding: '0 12px',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  const postLocalesData = () => [
    {
      lang: 'en-US',
      label: 'English',
      icon: '🇺🇸',
      title: 'Language',
    },
    {
      lang: 'zh-CN',
      label: '简体中文',
      icon: '🇨🇳',
      title: '语言',
    },
  ];

  if (!initialState || !initialState.settings) {
    return null;
  }

  return (
    <div className={className}>
      <Timezone />
      <Avatar />
      <SelectLang className={actionClassName} reload={false} postLocalesData={postLocalesData} />
    </div>
  );
};
export default GlobalHeaderRight;
