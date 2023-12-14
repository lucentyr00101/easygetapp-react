import api from './zh-CN/api';
import button from './zh-CN/button';
import component from './zh-CN/component';
import dropdown from './zh-CN/dropdown';
import error from './zh-CN/error';
import globalHeader from './zh-CN/globalHeader';
import login from './zh-CN/login';
import menu from './zh-CN/menu';
import message from './zh-CN/message';
import notification from './zh-CN/notification';
import pages from './zh-CN/pages';
import pwa from './zh-CN/pwa';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';

export default {
  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'layout.user.link.privacy': '隐私',
  'layout.user.link.terms': '条款',
  'app.copyright.produced': '蚂蚁集团体验技术部出品',
  'app.preview.down.block': '下载此页面到本地项目',
  'app.welcome.link.fetch-blocks': '获取全部区块',
  'app.welcome.link.block-list': '基于 block 开发，快速构建标准页面',
  'something-went-wrong': '出了些问题。',
  saved: '已保存！',
  success: '成功!',
  continue: '继续',
  copied: '已复制至剪贴板',
  ...login,
  ...pages,
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...button,
  ...api,
  ...dropdown,
  ...message,
  ...notification,
  ...error,
};
