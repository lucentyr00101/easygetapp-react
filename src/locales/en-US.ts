import api from './en-US/api';
import button from './en-US/button';
import component from './en-US/component';
import dropdown from './en-US/dropdown';
import error from './en-US/error';
import globalHeader from './en-US/globalHeader';
import login from './en-US/login';
import menu from './en-US/menu';
import message from './en-US/message';
import notification from './en-US/notification';
import pages from './en-US/pages';
import pwa from './en-US/pwa';
import settingDrawer from './en-US/settingDrawer';
import settings from './en-US/settings';

export default {
  'navBar.lang': 'Languages',
  'layout.user.link.help': 'Help',
  'layout.user.link.privacy': 'Privacy',
  'layout.user.link.terms': 'Terms',
  'app.copyright.produced': 'Produced by Ant Financial Experience Department',
  'app.preview.down.block': 'Download this page to your local project',
  'app.welcome.link.fetch-blocks': 'Get all block',
  'app.welcome.link.block-list': 'Quickly build standard, pages based on `block` development',
  'something-went-wrong': 'Something went wrong.',
  saved: 'Saved!',
  success: 'Success!',
  continue: 'Continue',
  copied: 'Copied to clipboard',
  ...login,
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...pages,
  ...button,
  ...api,
  ...dropdown,
  ...message,
  ...notification,
  ...error,
};
