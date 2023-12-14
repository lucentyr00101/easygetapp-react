import { DropdownContext } from '@/contexts/dropdown.context';
import { sysRoleAdd, sysRoleUpdate } from '@/services/api/roles';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useIntl, useModel } from '@umijs/max';
import { useContext } from 'react';
import { STATUS_CODE } from '../utils/dictionary.enum';
import { RoleSettingsTableListItem } from './data';

import { useGlobalContext } from '@/contexts/global.context';

type Props = {
  visible: boolean;
  onVisibleChange: React.Dispatch<React.SetStateAction<boolean>>;
  currentRow?: RoleSettingsTableListItem;
  close: () => void;
  onSubmit: () => void;
};

const AddEditModal: React.FC<Props> = (props) => {
  const { appMessage } = useGlobalContext();
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const { statusType } = useContext(DropdownContext);
  const { visible, onVisibleChange, currentRow, close, onSubmit } = props;

  const statusTypeEnum = statusType.reduce(
    (prev: any, curr: any) => ({
      ...prev,
      [curr]: {
        text: intl.formatMessage({ id: `dropdown.select.${curr.toLowerCase()}` }),
      },
    }),
    {},
  );

  const handleSubmit = async (value: any) => {
    let data;
    const { name, status, remarks } = value;
    try {
      if (currentRow === undefined) {
        data = await sysRoleAdd({
          applicationId: currentUser?.application?.id,
          name,
          status,
          remarks,
        });
      } else {
        data = await sysRoleUpdate({
          id: currentRow?.id,
          applicationId: currentRow?.application?.id,
          name,
          status,
          remarks,
        });
      }
      if (data.success) {
        appMessage({
          type: 'success',
          localesId: currentRow === undefined ? 'messages.role.added' : 'messages.role.updated',
        });
        return Promise.resolve(onSubmit());
      }
    } catch (error: any) {
      if (error.response.data.code === 502) {
        appMessage({ type: 'error', localesId: 'messages.role.nameExists' });
      } else {
        appMessage({ type: 'error', apiResponse: error });
      }
    }
  };

  return (
    <ModalForm
      title={
        currentRow === undefined
          ? intl.formatMessage({ id: 'pages.roles.addNewRole' })
          : intl.formatMessage({ id: 'pages.roles.editRole' })
      }
      width={636}
      open={visible}
      layout="horizontal"
      onOpenChange={onVisibleChange}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      modalProps={{
        maskClosable: false,
        destroyOnClose: true,
        onCancel: () => close(),
        okText: intl.formatMessage({ id: 'button.save' }),
      }}
      onFinish={handleSubmit}
      initialValues={{
        name: currentRow?.name,
        status: currentRow?.status || STATUS_CODE.ENABLE,
        remarks: currentRow?.remarks,
      }}
    >
      <ProFormText
        name="name"
        label={intl.formatMessage({ id: 'pages.roles.roleName' })}
        fieldProps={{ maxLength: 25 }}
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'message.required.roleName' }),
          },
        ]}
      ></ProFormText>
      <ProFormSelect
        name="status"
        label={intl.formatMessage({ id: 'pages.common.status' })}
        valueEnum={statusTypeEnum}
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'message.required.status' }),
          },
        ]}
      />
      <ProFormTextArea
        name="remarks"
        label={intl.formatMessage({ id: 'pages.common.remarks' })}
        fieldProps={{ autoSize: { minRows: 4 }, maxLength: 50 }}
      />
    </ModalForm>
  );
};

export default AddEditModal;
