import { useApplicationContext } from '@/contexts/application.context';
import { useGlobalContext } from '@/contexts/global.context';
import { APP_ATTRIBUTE_STATUS_CODE } from '@/pages/utils/dictionary.enum';
import { addAttributes, updateAttributes } from '@/services/api/app-management';
import { CloseCircleOutlined } from '@ant-design/icons';
import { ModalForm, ProFormList, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Space } from 'antd';
import { AttributesTableListItem } from './data';

const AddEditAttributesModal: React.FC<{
  visible: boolean;
  appOS: React.Key;
  onVisibleChange: React.Dispatch<React.SetStateAction<boolean>>;
  currentRow?: AttributesTableListItem;
  isView?: boolean;
  isDuplicate?: boolean;
  close: () => void;
  refreshTable: () => void;
}> = (props) => {
  const { visible, onVisibleChange, currentRow, isView, isDuplicate, appOS, close, refreshTable } =
    props;
  const intl = useIntl();
  const { appMessage } = useGlobalContext();
  const { currentApp } = useApplicationContext();

  const closeModal = () => {
    close();
  };
  const handleSubmit = async (values: any) => {
    try {
      const form = {
        ...(currentRow && { id: currentRow?.id }),
        appId: currentApp?.id,
        operatingSystem: values.operatingSystem,
        versionNumber: values.versionNumber,
        status: values.status,
        attributeSettings: values.attributeSettings,
      };
      if (currentRow && !isDuplicate) await updateAttributes(form);
      else await addAttributes(form);
      appMessage({
        type: 'success',
        localesId:
          currentRow && !isDuplicate
            ? 'notification.app.attributes.updated'
            : 'notification.app.attributes.added',
      });
      refreshTable();
      closeModal();
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
  };

  return (
    <ModalForm
      title={
        currentRow === undefined || isDuplicate
          ? intl.formatMessage({ id: 'component.app.add-attributes' })
          : isView
          ? intl.formatMessage({ id: 'component.app.view-attributes' })
          : intl.formatMessage({ id: 'component.app.edit-attributes' })
      }
      open={visible}
      layout="horizontal"
      onFinish={async (v) => handleSubmit(v)}
      onOpenChange={onVisibleChange}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      modalProps={{
        maskClosable: false,
        destroyOnClose: true,
        onCancel: () => closeModal(),
        okText: intl.formatMessage({ id: 'button.submit' }),
      }}
      submitter={
        isView
          ? {
              resetButtonProps: {
                style: {
                  display: 'none',
                },
              },
              submitButtonProps: {
                style: {
                  display: 'none',
                },
              },
            }
          : {}
      }
      initialValues={{
        appName: currentApp?.name,
        operatingSystem: appOS,
        versionNumber: currentRow?.versionNumber,
        status: currentRow?.status,
        attributeSettings:
          currentRow === undefined
            ? [{ name: '', value: '', remarks: '' }]
            : currentRow?.attributeSettings,
        createdBy: currentRow?.createdBy,
        createdTime: currentRow?.createdTime,
        updatedBy: currentRow?.updatedBy,
        updatedTime: currentRow?.updatedTime,
      }}
    >
      {isView && (
        <ProFormList
          name="attributeSettings"
          label={intl.formatMessage({ id: 'component.app.attribute-settings' })}
          creatorButtonProps={
            isView
              ? false
              : {
                  position: 'bottom',
                  creatorButtonText: intl.formatMessage({ id: 'component.app.click-to-add' }),
                }
          }
          copyIconProps={false}
          deleteIconProps={
            isView
              ? false
              : {
                  Icon: CloseCircleOutlined,
                  tooltipText: 'Delete',
                }
          }
          required={!isView}
          min={1}
          max={20}
          style={{ margin: 0 }}
        >
          <Space align="baseline">
            <ProFormText
              name="name"
              placeholder={intl.formatMessage({ id: 'component.app.parameter-name' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'error.parameter-name.required' }),
                },
              ]}
              fieldProps={{
                maxLength: 100,
              }}
              disabled={isView}
            />
            <ProFormText
              name="value"
              placeholder={intl.formatMessage({ id: 'component.app.parameter-value' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'error.parameter-value.required' }),
                },
              ]}
              fieldProps={{
                maxLength: 100,
              }}
              disabled={isView}
            />
            <ProFormText
              name="remarks"
              placeholder=""
              fieldProps={{
                maxLength: 100,
              }}
              disabled={isView}
            />
          </Space>
        </ProFormList>
      )}
      {!isView && (
        <ProFormText
          name="appName"
          label={intl.formatMessage({ id: 'component.app.app-name' })}
          readonly
        />
      )}
      {!isView && (
        <ProFormText
          name="operatingSystem"
          label={intl.formatMessage({ id: 'pages.app.operating-system' })}
          readonly={!isView}
          disabled={isView}
        />
      )}
      <ProFormText
        fieldProps={{
          maxLength: 10,
          min: 1,
        }}
        name="versionNumber"
        label={intl.formatMessage({ id: 'pages.app.version' })}
        rules={[
          {
            required: !isView,
            message: intl.formatMessage({ id: 'error.version-number.required' }),
          },
          {
            validator: (_, value) => {
              const regexp = /^[.0-9]*$/;
              const valid = regexp.test(value);
              return valid || value === undefined
                ? Promise.resolve()
                : Promise.reject(new Error(intl.formatMessage({ id: 'error.number-dot.only' })));
            },
          },
        ]}
        disabled={isView}
      />
      {isView && (
        <ProFormText
          name="operatingSystem"
          label={intl.formatMessage({ id: 'pages.app.operating-system' })}
          readonly={!isView}
          disabled={isView}
        />
      )}
      {isView && (
        <ProFormText
          name="createdBy"
          label={intl.formatMessage({ id: 'component.app.created-by' })}
          disabled
        />
      )}
      {isView && (
        <ProFormText
          name="createdTime"
          label={intl.formatMessage({ id: 'component.app.created-time' })}
          disabled
        />
      )}
      {isView && (
        <ProFormText
          name="updatedBy"
          label={intl.formatMessage({ id: 'component.app.updated-by' })}
          disabled
        />
      )}
      {isView && (
        <ProFormText
          name="updatedTime"
          label={intl.formatMessage({ id: 'component.app.updated-time' })}
          disabled
        />
      )}
      {!isView && (
        <ProFormSelect
          name="status"
          label={intl.formatMessage({ id: 'pages.common.status' })}
          initialValue={APP_ATTRIBUTE_STATUS_CODE.DRAFT}
          valueEnum={{
            [APP_ATTRIBUTE_STATUS_CODE.LIVE]: intl.formatMessage({ id: 'dropdown.select.live' }),
            [APP_ATTRIBUTE_STATUS_CODE.DRAFT]: intl.formatMessage({ id: 'dropdown.select.draft' }),
          }}
          rules={[{ required: true, message: intl.formatMessage({ id: 'error.status.required' }) }]}
        />
      )}
      {!isView && (
        <ProFormList
          name="attributeSettings"
          label={intl.formatMessage({ id: 'component.app.attribute-settings' })}
          creatorButtonProps={
            isView
              ? false
              : {
                  position: 'bottom',
                  creatorButtonText: intl.formatMessage({ id: 'component.app.click-to-add' }),
                }
          }
          copyIconProps={false}
          deleteIconProps={
            isView
              ? false
              : {
                  Icon: CloseCircleOutlined,
                  tooltipText: 'Delete',
                }
          }
          required={!isView}
          min={1}
          max={20}
        >
          <Space align="baseline">
            <ProFormText
              name="name"
              placeholder={intl.formatMessage({ id: 'component.app.parameter-name' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'error.parameter-name.required' }),
                },
              ]}
              fieldProps={{
                maxLength: 100,
              }}
              disabled={isView}
            />
            <ProFormText
              name="value"
              placeholder={intl.formatMessage({ id: 'component.app.parameter-value' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'error.parameter-value.required' }),
                },
              ]}
              fieldProps={{
                maxLength: 100,
              }}
              disabled={isView}
            />
            <ProFormText
              name="remarks"
              placeholder={intl.formatMessage({ id: 'pages.common.remarks' })}
              fieldProps={{
                maxLength: 100,
              }}
              disabled={isView}
            />
          </Space>
        </ProFormList>
      )}
    </ModalForm>
  );
};

export default AddEditAttributesModal;
