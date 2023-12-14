import { useGlobalContext } from '@/contexts/global.context';
import { templateAdd, templateUpdate } from '@/services/api/template-management';
import { ModalForm, ProFormText, ProFormUploadButton } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { UploadFile } from 'antd';
import { useState } from 'react';
import { TemplateManagementTableListItem } from './data';

type Props = {
  visible: boolean;
  onVisibleChange: React.Dispatch<React.SetStateAction<boolean>>;
  currentRow?: TemplateManagementTableListItem;
  close: () => void;
  onSubmit: () => void;
};

const AddEditModal: React.FC<Props> = (props) => {
  const { appMessage } = useGlobalContext();
  const intl = useIntl();
  const { visible, onVisibleChange, currentRow, close, onSubmit } = props;
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const closeModal = () => {
    close();
    setFileList([]);
  };

  const uploadZip = async (file: File, fileList: UploadFile[]) => {
    try {
      const extension = file.name.split('.').pop();
      const allowedExtensions = ['zip'];
      if (!allowedExtensions.includes(extension as string)) {
        appMessage({ type: 'error', localesId: 'messages.template-management.zipFileOnly' });
        return;
      } else {
        setFileList([...fileList]);
      }
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
      throw error;
    }
    return false;
  };

  const handleSubmit = async (value: any) => {
    try {
      const { name, upload } = value || {};
      const file = upload?.[0].originFileObj;
      const form = {
        name,
        ...(currentRow && { id: currentRow?.id }),
      };
      const formData = new FormData();
      formData.append(
        currentRow ? 'templateUpdateParam' : 'templateAddParam',
        new Blob([JSON.stringify(form)], { type: 'application/json' }),
      );
      if (file) formData.append('file', file);
      if (currentRow !== undefined) await templateUpdate(formData);
      else await templateAdd(formData);
      appMessage({
        type: 'success',
        localesId:
          currentRow === undefined
            ? 'notification.template-management.added'
            : 'notification.template-management.updated',
      });
      closeModal();
      return Promise.resolve(onSubmit());
    } catch (error: any) {
      if (error.response.data.code === 1103) {
        appMessage({ type: 'error', localesId: 'messages.template-management.templateNameExists' });
      } else {
        appMessage({ type: 'error', apiResponse: error });
      }
    }
  };

  return (
    <ModalForm
      title={
        currentRow === undefined
          ? intl.formatMessage({ id: 'pages.template-management.addNew' })
          : intl.formatMessage({ id: 'pages.template-management.edit' })
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
        onCancel: () => closeModal(),
        okText: intl.formatMessage({ id: 'button.save' }),
      }}
      onFinish={handleSubmit}
      initialValues={{
        name: currentRow?.name,
      }}
    >
      <ProFormText
        name="name"
        placeholder={intl.formatMessage({ id: 'pages.template-management.templateName' })}
        label={intl.formatMessage({ id: 'pages.template-management.templateName' })}
        fieldProps={{ maxLength: 25 }}
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'message.required.templateName' }),
          },
        ]}
      ></ProFormText>

      <ProFormUploadButton
        name="upload"
        label={intl.formatMessage({ id: 'pages.template-management.templateZipFile' })}
        fieldProps={{
          name: 'file',
          accept: '.zip',
          maxCount: 1,
          fileList: fileList,
          beforeUpload: uploadZip,
          onRemove: () => setFileList([]),
        }}
        title={intl.formatMessage({ id: 'pages.template-management.uploadTemplateZipFile' })}
        rules={[
          {
            required: currentRow === undefined ? true : false,
            message: intl.formatMessage({ id: 'message.required.templateZipFile' }),
          },
        ]}
      />
    </ModalForm>
  );
};

export default AddEditModal;
