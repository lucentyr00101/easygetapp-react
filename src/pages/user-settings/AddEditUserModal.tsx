import { DropdownContext } from '@/contexts/dropdown.context';
import { getDropdownRoles } from '@/services/api/dropdown';
import { sysUserAdd, sysUserUpdate } from '@/services/api/user-settings';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useIntl, useModel } from '@umijs/max';
import { useContext, useState } from 'react';
import { STATUS_CODE } from '../utils/dictionary.enum';
import { UserSettingsTableListItem } from './data';

import { useGlobalContext } from '@/contexts/global.context';
import { Spin } from 'antd';

const AddEditUserModal: React.FC<{
  visible: boolean;
  onVisibleChange: React.Dispatch<React.SetStateAction<boolean>>;
  currentRow?: UserSettingsTableListItem;
  close: () => void;
  onSubmit: () => void;
}> = (props) => {
  const { appMessage } = useGlobalContext();
  const intl = useIntl();
  const { statusType } = useContext(DropdownContext);
  const [loading, setLoading] = useState(false);
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  const { visible, onVisibleChange, currentRow, close, onSubmit } = props;

  const statusTypeEnum = statusType.reduce(
    (prev: any, curr: any) => ({
      ...prev,
      [curr]: {
        text: intl.formatMessage({
          id: `dropdown.select.${curr.toLowerCase()}`,
        }),
      },
    }),
    {},
  );

  const validateIPAddressFormat = (value: any) => {
    const IsCommaExist = value.includes(',');
    const ipAddressFormat =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const msg = intl.formatMessage({ id: 'message.error.ipWhitelist' });
    const maxIpCount = intl.formatMessage({ id: 'message.error.maxIpCount' });

    if (IsCommaExist) {
      const newValueArray = value.split(',');
      const validateNewValueArrayIPAddress = newValueArray.map((val: string) =>
        ipAddressFormat.test(val),
      );

      if (newValueArray.length > 10) {
        return Promise.reject(maxIpCount);
      }

      if (validateNewValueArrayIPAddress.includes(false)) {
        return Promise.reject(msg);
      } else {
        return Promise.resolve();
      }
    }
    if (ipAddressFormat.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(msg);
  };

  const handleSubmit = async (value: any) => {
    const { account, roleIds, password, status, gaStatus, remarks, ipWhitelist } = value;
    const form = {
      account,
      roleIds,
      password,
      status,
      gaStatus,
      remarks,
      ipWhitelist,
      applicationId: currentUser?.application?.id,
      ...(currentRow ? { id: currentRow?.id } : {}),
    };
    console.log({ form });
    const formData = new FormData();
    formData.append(
      currentRow ? 'sysUserUpdateParam' : 'sysUserAddParam',
      new Blob([JSON.stringify(form)], { type: 'application/json' }),
    );
    try {
      if (currentRow === undefined) {
        await sysUserAdd(formData);
      } else {
        await sysUserUpdate(formData);
      }
      if (currentRow) appMessage({ type: 'success', localesId: 'messages.changesAreSaved' });
      else appMessage({ type: 'success', localesId: 'messages.userHasBeenAdded' });
      return Promise.resolve(onSubmit());
    } catch (error: any) {
      if (error.response.data.code === 502) {
        appMessage({ type: 'error', localesId: 'messages.userNameAlreadyExists' });
      } else {
        appMessage({ type: 'error', apiResponse: error });
      }
    }
  };

  return (
    <ModalForm
      title={
        currentRow === undefined
          ? intl.formatMessage({
              id: 'pages.userSetting.addNewUser',
            })
          : intl.formatMessage({
              id: 'pages.userSetting.editUser',
            })
      }
      open={visible}
      layout="horizontal"
      onOpenChange={onVisibleChange}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      modalProps={{
        maskClosable: false,
        destroyOnClose: true,
        onCancel: () => close(),
        okText: intl.formatMessage({
          id: 'button.save',
        }),
      }}
      onFinish={handleSubmit}
      initialValues={{
        account: currentRow?.username,
        status: currentRow?.status || STATUS_CODE.ENABLE,
        gaStatus: currentRow?.gaStatus || STATUS_CODE.ENABLE,
        password: currentRow?.password,
        remarks: currentRow?.remarks,
        ipWhitelist: currentRow?.ipWhitelist,
        roleIds: currentRow?.roles?.map((x: any) => x.id),
      }}
    >
      <ProFormText
        name="account"
        label={intl.formatMessage({
          id: 'pages.userSetting.userName',
        })}
        fieldProps={{
          maxLength: 25,
        }}
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: 'message.required.userName',
            }),
          },
        ]}
      />
      <ProFormSelect
        name="status"
        label={intl.formatMessage({
          id: 'pages.common.status',
        })}
        valueEnum={statusTypeEnum}
        initialValue="Enable"
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: 'message.required.status',
            }),
          },
        ]}
      />
      <Spin spinning={loading}>
        <ProFormSelect
          name="roleIds"
          label={intl.formatMessage({
            id: 'pages.userSetting.roles',
          })}
          fieldProps={{
            mode: 'multiple',
          }}
          request={async () => {
            setLoading(true);
            try {
              const { data } = await getDropdownRoles();
              setLoading(false);
              return data.map((role: any) => {
                const { id, name } = role;
                return { value: id, label: name };
              });
            } catch (e) {
              console.log(e);
              setLoading(false);
              return [];
            }
          }}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'message.required.roleName',
              }),
            },
          ]}
        />
      </Spin>
      <ProFormText.Password
        name="password"
        label={intl.formatMessage({
          id: 'pages.userSetting.password',
        })}
        fieldProps={{
          maxLength: 16,
        }}
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: 'message.required.password',
            }),
          },
          {
            min: 8,
            max: 16,
            message: intl.formatMessage({
              id: 'message.error.passwordLength',
            }),
          },
        ]}
      />
      <ProFormSelect
        name="gaStatus"
        label={intl.formatMessage({
          id: 'pages.userSetting.gaStatus',
        })}
        valueEnum={statusTypeEnum}
        initialValue="Enable"
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: 'message.required.gaCodeStatus',
            }),
          },
        ]}
      />
      <ProFormTextArea
        name="remarks"
        label={intl.formatMessage({
          id: 'pages.userSetting.remarks',
        })}
        fieldProps={{ autoSize: { minRows: 4 }, maxLength: 50 }}
      />
      <ProFormTextArea
        name="ipWhitelist"
        label={intl.formatMessage({
          id: 'pages.userSetting.iPWhitelist',
        })}
        fieldProps={{ autoSize: { minRows: 4 } }}
        rules={[
          {
            validator: (_, value) => {
              if (value !== undefined && value !== null && value !== '') {
                return validateIPAddressFormat(value);
              }
              return Promise.resolve();
            },
          },
        ]}
      />
    </ModalForm>
  );
};

export default AddEditUserModal;
