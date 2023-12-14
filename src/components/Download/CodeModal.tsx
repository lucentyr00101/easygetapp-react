import { useGlobalContext } from '@/contexts/global.context';
import { downloadFromUrl } from '@/global';
import { publicVerifyDownload } from '@/services/api/app-management';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { history, useIntl } from '@umijs/max';
import { Form } from 'antd';
import type { FC } from 'react';

interface Props {
  visible: boolean;
  onOpenChange: any;
}

const CodeModal: FC<Props> = ({ visible, onOpenChange }) => {
  const { appMessage } = useGlobalContext();
  const intl = useIntl();
  const [form] = Form.useForm();

  const query = Object.fromEntries(new URLSearchParams(history?.location?.search));
  const { showPass, showCode, version } = query || {};

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        id: version,
        ...(showPass === 'true' && { password: values.code }),
        ...(showCode === 'true' && { code: values.code }),
      };
      const { data: url } = await publicVerifyDownload(data);
      downloadFromUrl(url);
      onOpenChange(false);
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
  };

  return (
    <ModalForm
      form={form}
      open={visible}
      onFinish={async (v) => handleSubmit(v)}
      onOpenChange={onOpenChange}
      width={500}
      modalProps={{
        centered: true,
        destroyOnClose: true,
        maskClosable: false,
      }}
      submitter={{
        searchConfig: {
          submitText: intl.formatMessage({ id: 'button.confirm' }),
          resetText: intl.formatMessage({ id: 'button.cancel' }),
        },
      }}
    >
      {showPass === 'true' && <p>{intl.formatMessage({ id: 'pages.download.password.text' })}</p>}
      {showCode === 'true' && <p>{intl.formatMessage({ id: 'pages.download.code.text' })}</p>}
      <ProFormText
        name="code"
        placeholder={intl.formatMessage({
          id:
            showPass === 'true'
              ? intl.formatMessage({ id: 'pages.download.password.placeholder' })
              : intl.formatMessage({ id: 'pages.download.code.text' }),
        })}
        rules={[
          {
            required: true,
            message:
              showPass === 'true'
                ? intl.formatMessage({ id: 'error.installation-password.required' })
                : intl.formatMessage({ id: 'error.installation-code.required' }),
          },
        ]}
      />
    </ModalForm>
  );
};

export default CodeModal;
