import { useApplicationContext } from '@/contexts/application.context';
import { useGlobalContext } from '@/contexts/global.context';
import { fetchAppTemplates, fetchFields, updateTemplate } from '@/services/api/template-config';
import { PlusOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormInstance,
  ProFormItem,
  ProFormSelect,
  ProFormText,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { useIntl, useModel } from '@umijs/max';
import { Card, Divider, Form, Typography } from 'antd';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

const TemplateConfiguration: FC = () => {
  const intl = useIntl();
  const { Title } = Typography;
  const { currentApp, handleGetCurrentAppDetails } = useApplicationContext();
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [templateFields, setTemplateFields] = useState<any>([]);
  // const [fileList, setFileList] = useState<any>([])
  const { appMessage } = useGlobalContext();
  const [form] = Form.useForm();
  const fieldsForm = useRef<ProFormInstance>();
  const [templates, setTemplates] = useState<any>([]);
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [templateName, setTemplateName] = useState('');
  const [deletedImages, setDeletedImages] = useState<any>([]);

  const fetchTemplates = async () => {
    try {
      const { data } = await fetchAppTemplates({ id: currentApp.id });
      setTemplates(() => data);
      return data.map((item: any) => {
        return { value: item.id, label: item.templateName };
      });
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  const submitForm = async (values: any) => {
    const filteredFiles = Object.values(values)
      .filter((x: any) => typeof x === 'object' && x?.[0]?.uid !== '-1')
      .flat();
    const files = filteredFiles.map((x: any) => x.originFileObj);
    const generateTemplateViews = (formValues: any) => {
      return templateFields.reduce((acc: any, field: any) => {
        const _data = {
          ...field,
          value:
            typeof formValues[field.id] === 'string' // if formValue is a text input
              ? formValues[field.id]
              : typeof formValues[field.id] === 'object' && formValues[field.id]?.[0]?.uid !== '-1' // if formValue is an uploaded image
              ? formValues[field.id]?.[0]?.name || field.value
              : '',
          fileName:
            field.type === 'img' && formValues[field.id]?.[0]?.uid !== '-1'
              ? formValues[field.id]?.[0]?.name
              : field.value,
        };
        acc.push(_data);
        return acc;
      }, []);
    };
    const form = {
      id: currentApp?.templateConfigurationId || '',
      app: { id: currentApp?.id },
      template: { id: currentTemplate?.value || currentApp?.templateId },
      templateViews: generateTemplateViews(values),
      deletedFiles: [...deletedImages],
    };
    const formData = new FormData();
    formData.append(
      'templateConfigurationUpdateParam',
      new Blob([JSON.stringify(form)], { type: 'application/json' }),
    );
    if (files.length) {
      files.forEach((x: any) => formData.append('files', x));
    }
    console.log({ form, files });
    try {
      await updateTemplate(formData);
      await handleGetCurrentAppDetails(currentApp.id);
      appMessage({ type: 'success', localesId: 'notification.param-config.saved' });
    } catch (e: any) {
      console.log(e);
      appMessage({ type: 'error', apiResponse: e });
    }
  };

  const setInitialValues = () => {
    const data = templateFields.reduce((acc: any, field: any) => {
      if (field.type === 'text') {
        const { name, value } = field;
        acc[name] = value;
      } else if (field.type === 'hidden') {
        const { name } = field;
        if (name === 'installationPage') acc[name] = currentApp?.installationPage;
        else if (name === 'pitbullRegistrationId')
          acc[name] = currentUser?.application.oauth2RegisteredClient?.clientId;
      }

      return acc;
    }, {});
    return Promise.resolve(data);
  };

  // const handleFileChange = (file: File, name: string) => {
  //   console.log('changed')
  //   setFileList((prevFileList: any) => {
  //     console.log({prevFileList})
  //     return [
  //       ...prevFileList,
  //       { key: name, file }
  //     ]
  //   })
  // }

  const fetchTemplateFields = async (value: any, option: any) => {
    fieldsForm?.current?.resetFields();
    setTemplateFields([]);
    try {
      const payload = {
        appId: currentApp.id,
        ...(value ? { templateId: value } : {}),
      };
      const { data } = await fetchFields(payload);
      const { templateViews, template } = data;
      const { templateName } = template;
      setCurrentTemplate(option);
      setTemplateName(templateName);
      setTemplateFields(() => templateViews || []);
    } catch (e) {
      setCurrentTemplate(null);
      console.log(e);
    }
  };

  const removeImage = (file: any) => {
    const { id, value } = file;
    setDeletedImages((prevDeletedImages: any) => {
      return [...prevDeletedImages, { id, value }];
    });
  };

  useEffect(() => {
    setDeletedImages([]);
    if (currentApp && templates.length > 0) {
      form.setFieldsValue({
        searchTemplate: currentApp?.templateId,
      });
      const template = templates.find((_template: any) => _template.id === currentApp?.templateId);
      let option = null;
      if (template) {
        option = {
          value: template.id,
          title: template.templateName,
          label: template.templateName,
          key: template.id,
          className: 'ant-pro-filed-search-select-option',
          ['data-item']: {
            value: template.id,
            label: template.templateName,
          },
        };
      }
      fetchTemplateFields(template?.id, option);
      return;
    }
    form.setFieldsValue({
      searchTemplate: null,
    });
    setCurrentTemplate(null);
  }, [currentApp.id, templates]);

  return (
    <Card>
      <ProFormItem>
        <Title level={5}>
          {intl.formatMessage({ id: 'pages.template-config.modify-template' })}
        </Title>
      </ProFormItem>
      <ProForm labelCol={{ span: 7 }} wrapperCol={{ span: 12 }} submitter={false} form={form}>
        <ProFormSelect
          name="searchTemplate"
          label={intl.formatMessage({
            id: 'pages.template-config.search-template',
          })}
          placeholder={intl.formatMessage({
            id: 'pages.template-config.search-template',
          })}
          request={fetchTemplates}
          fieldProps={{
            showSearch: true,
            onChange: fetchTemplateFields,
          }}
        />
      </ProForm>
      {(!!currentTemplate || !!templateFields?.length) && (
        <ProForm
          formRef={fieldsForm}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 9 }}
          layout="horizontal"
          labelWrap={true}
          submitter={{
            searchConfig: {
              submitText: intl.formatMessage({ id: 'button.save' }),
            },
            resetButtonProps: {
              style: { display: 'none' },
            },
          }}
          onFinish={submitForm}
          request={setInitialValues}
        >
          <Divider />
          <ProFormItem>
            <Title level={5}>
              {intl.formatMessage({ id: 'pages.template-config.parameter-config' })}
            </Title>
          </ProFormItem>
          <ProFormText
            name="templateName"
            fieldProps={{
              value: currentTemplate?.label || templateName,
            }}
            disabled
            label={intl.formatMessage({
              id: 'pages.template-config.template-name',
            })}
          />
          {templateFields.map((field: any) => {
            const { type, id, name, description } = field;
            if (type === 'text') {
              return (
                <ProFormText
                  label={description}
                  key={id || Math.floor(Math.random() * 100_000)}
                  id={id}
                  name={id}
                />
              );
            } else if (type === 'hidden') {
              return (
                <ProFormText
                  label={description}
                  key={id || Math.floor(Math.random() * 100_000)}
                  id={id}
                  name={id}
                  hidden={true}
                  value={
                    name === 'installationPage'
                      ? currentApp?.installationPage
                      : currentUser?.application.oauth2RegisteredClient?.clientId
                  }
                />
              );
            } else if (type === 'img') {
              // return <ProFormItem key={index} label={description}>
              //   <Upload
              //     id={id}
              //     accept={'.jpg,.jpeg,.png'}
              //     listType="picture-card"
              //     onChange={(file: any) => handleFileChange(file, name)}
              //     beforeUpload={() => false}
              //     maxCount={1}
              //   >
              //     {<PlusOutlined />}
              //   </Upload>
              // </ProFormItem>
              return (
                <ProFormUploadButton
                  label={description}
                  key={id || Math.floor(Math.random() * 100_000)}
                  id={id}
                  name={id}
                  icon={<PlusOutlined />}
                  initialValue={
                    field.fileLink
                      ? [
                          {
                            uid: '-1',
                            name: 'image.png',
                            status: 'done',
                            url: field.fileLink,
                            id: field.id,
                            value: field.value,
                          },
                        ]
                      : []
                  }
                  // onChange={(file: any) => handleFileChange(file, name)}
                  title={false}
                  max={1}
                  fieldProps={{
                    name: 'file',
                    listType: 'picture-card',
                    beforeUpload: () => false,
                    onRemove: removeImage,
                  }}
                  accept={'.jpg,.jpeg,.png'}
                />
              );
            }
            return null;
          })}
        </ProForm>
      )}
    </Card>
  );
};

export default TemplateConfiguration;
