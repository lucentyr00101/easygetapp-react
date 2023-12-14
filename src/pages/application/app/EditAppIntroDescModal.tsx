import { useApplicationContext } from '@/contexts/application.context';
import { useGlobalContext } from '@/contexts/global.context';
import { updateNotesInstructions } from '@/services/api/app-management';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import type { AppDetailItem } from './data';

const EditAppIntroDescModal: React.FC<{
  visible: boolean;
  onVisibleChange: React.Dispatch<React.SetStateAction<boolean>>;
  app: AppDetailItem;
}> = (props) => {
  const { visible, onVisibleChange, app } = props;
  const { appMessage } = useGlobalContext();
  const intl = useIntl();
  const { handleGetCurrentAppDetails } = useApplicationContext();

  const handleSubmit = async (values: any) => {
    try {
      await updateNotesInstructions({ id: app.id, ...values });
      appMessage({ type: 'success', localesId: 'saved' });
      onVisibleChange(false);
      handleGetCurrentAppDetails(app?.id as string);
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
  };

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'component.app.app-instructions' })}
      layout="horizontal"
      open={visible}
      onOpenChange={onVisibleChange}
      onFinish={async (v) => handleSubmit(v)}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      initialValues={{
        instructions: app.instructions,
        releaseNotes: app.releaseNotes,
      }}
      modalProps={{
        maskClosable: false,
        destroyOnClose: true,
        okText: intl.formatMessage({ id: 'button.save' }),
      }}
    >
      <ProFormTextArea
        name="instructions"
        label={intl.formatMessage({ id: 'component.app.appInstructions' })}
        fieldProps={{ autoSize: { minRows: 5 }, maxLength: 1000 }}
      />
      <ProFormTextArea
        name="releaseNotes"
        label={intl.formatMessage({ id: 'component.app.releaseNotes' })}
        fieldProps={{ autoSize: { minRows: 5 }, maxLength: 1000 }}
      />
    </ModalForm>
  );
};

export default EditAppIntroDescModal;
