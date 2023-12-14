import { useGlobalContext } from '@/contexts/global.context';
import { convertFileSize } from '@/global';
import type { MarketingItem } from '@/pages/marketing';
import { MARKETING_TYPES } from '@/pages/utils/dictionary.enum';
import { getMarketingApps, marketTypes } from '@/services/api/dropdown';
import { addMarket, updateMarket } from '@/services/api/marketing';
import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-components';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, Divider, Form, message, Spin, Typography, Upload } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import { FC, useEffect, useRef, useState } from 'react';

type Props = {
  visible: boolean;
  currentRow: MarketingItem | null;
  refreshTable: () => void;
  onOpenChange: any;
  close: () => void;
};

const MarketingForm: FC<Props> = ({ visible, onOpenChange, currentRow, refreshTable, close }) => {
  const intl = useIntl();
  const [splashFileList, setSplashFileList] = useState<any>([]);
  const [splashImageUrl, setSplashImageUrl] = useState<any>(null);
  const [fileList, setFileList] = useState<any>([]);
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [videoList, setVideoList] = useState<any>([]);
  const { appMessage } = useGlobalContext();
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const formRef = useRef<ProFormInstance>();
  const [marketingTypes, setMarketingTypes] = useState<string[]>([]);
  const [appLoading, setAppLoading] = useState(false);

  const closeModal = () => {
    setSplashFileList([]);
    setSplashImageUrl(null);
    setFileList([]);
    setImageUrl([]);
    setVideoList([]);
    setDeletedImages([]);
    setMarketingTypes([]);
    formRef?.current?.resetFields();
    close();
  };

  const handleSubmit = async (values: any) => {
    try {
      const {
        video,
        videoTitle: title,
        videoUrl: url,
        images,
        splashUrl,
        splashButtonName,
        videoRemarks,
        splashRemarks,
        ...rest
      } = values;
      const hasUploadedVideo = video?.length > 0 && video.every((x: any) => x.uid !== -1);
      const form = {
        ...rest,
        marketSplashAd: {
          id:
            (splashFileList.length > 0 && splashFileList?.[0]?.originFileObj) || !splashImageUrl
              ? undefined
              : currentRow?.marketSplashAd?.id,
          url: splashUrl,
          buttonName: splashButtonName,
          remarks: splashRemarks,
        },
        marketAds: images?.map((v: any) => {
          return {
            url: v?.url || '',
            remarks: v?.remarks || '',
          };
        }),
        ...(title || url
          ? {
              marketVideo: {
                ...(currentRow?.marketVideo &&
                  (hasUploadedVideo || video.length === 0
                    ? {}
                    : {
                        id: currentRow?.marketVideo?.id || null,
                      })),
                title,
                url,
                remarks: videoRemarks,
              },
            }
          : {}),
        ...(currentRow
          ? {
              id: currentRow.id,
              deletedMarketAds: [...deletedImages],
              // oldMarketAdUrls: images.filter((x: any) => {
              //   const currentImagesIdMap = currentImages.map(y => y.id)
              //   return currentImagesIdMap.includes(x.id)
              // })
            }
          : {}),
      };
      console.log({ form });
      const formData = new FormData();
      formData.append(
        currentRow ? 'marketUpdateParam' : 'marketAddParam',
        new Blob([JSON.stringify(form)], { type: 'application/json' }),
      );
      if (splashFileList.length > 0 && splashFileList?.[0]?.originFileObj) {
        formData.append('marketSplashAdFile', splashFileList[0].originFileObj);
      }
      if (hasUploadedVideo) {
        formData.append('marketVideoFile', video[0].originFileObj);
      }
      const adImages = images?.map((x: any) => x?.image?.file) || [];
      const f = new File([''], 'filename');
      if (adImages.length) {
        adImages.forEach((x: any) => formData.append('marketAdImageFiles', x || f));
      }
      if (!currentRow) await addMarket(formData);
      else await updateMarket(formData);
      appMessage({
        type: 'success',
        localesId: currentRow ? 'notification.marketing.updated' : 'notification.marketing.added',
      });
      closeModal();
      refreshTable();
    } catch (e: any) {
      console.log(e);
      appMessage({ type: 'error', apiResponse: e });
    }
  };

  const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  const handleSplashImageChange = (info: any) => {
    setSplashFileList([...info.fileList]);
    getBase64(info.file as RcFile, (url) => {
      setSplashImageUrl(url);
    });
  };

  const handleImageChange = (info: any, index: number) => {
    getBase64(info.file as RcFile, (url) => {
      setImageUrl((prev: any) => {
        const data = [...prev];
        data.splice(index, 1, url);
        return data;
      });
    });
  };

  const handleDeleteImage = (index: number) => {
    const images = formRef?.current?.getFieldValue('images');
    const { id } = images[index] || {};
    if (id) setDeletedImages((prev: any) => [...prev, id]);
  };

  const removeRow = (index: number, remove: (index: number) => void) => {
    if (currentRow) handleDeleteImage(index);
    remove(index);
    setImageUrl((prev: any) => {
      const data = [...prev];
      data.splice(index, 1);
      return data;
    });
  };

  const fileSizeValidation = async (file: File) => {
    return new Promise((resolve, reject) => {
      const ALLOWED_SIZE = 300 * 1024 * 1024 * 1024;
      const { size } = file;
      if (size > ALLOWED_SIZE) {
        const msg = intl.formatMessage({ id: 'message.image.exceeds-filesize' });
        message.error(msg);
        reject(400);
      } else {
        resolve(200);
      }
    });
  };

  const dimensionValidation = (
    file: File,
    allowedWidth: number = 728,
    allowedHeight: number = 90,
  ) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const image = new Image();
        image.src = e?.target?.result as string;
        image.onload = () => {
          const { height, width } = image;
          if (width !== allowedWidth || height !== allowedHeight) {
            const msg = intl.formatMessage({ id: 'message.image.incorrect-format' });
            message.error(msg);
            reject(400);
          } else {
            resolve(200);
          }
        };
      };
    });
  };

  const imageValidation = async (v: any, allowedWidth?: number, allowedHeight?: number) => {
    try {
      if (allowedWidth !== undefined && allowedHeight !== undefined) {
        await dimensionValidation(v, allowedWidth, allowedHeight);
      }
      await fileSizeValidation(v);
      return false;
    } catch (e) {
      console.log('error', e);
      return Upload.LIST_IGNORE;
    }
  };

  const handleVideoChange = ({ fileList }: any) => {
    setVideoList([...fileList]);
  };

  const fetchMarketingApps = async () => {
    try {
      setAppLoading(true);
      const { data } = currentRow
        ? await getMarketingApps({ id: currentRow?.id })
        : await getMarketingApps();
      return data.map((_data: any) => {
        const { id, name } = _data;
        return { label: name, value: id };
      });
    } catch (e) {
      console.log(e);
      return [];
    } finally {
      setAppLoading(false);
    }
  };

  const generateAdImagesThumbnail = () => {
    const data = currentRow?.marketAds?.map((x) => x?.imageInfo?.fileLink);
    setImageUrl(() => [...(data as any)]);
  };

  const setAdImagesInitial = () => {
    return currentRow?.marketAds?.map((market: any) => {
      return { id: market?.id, url: market?.url, remarks: market?.remarks };
    });
  };

  const generateFileList = (marketVideo: any) => {
    if (marketVideo) {
      const file = {
        uid: -1,
        name: marketVideo?.fileName,
        status: 'done',
        url: marketVideo?.fileLink,
      };
      setVideoList([file as any]);
    }
  };

  useEffect(() => {
    if (visible && !!currentRow) {
      setSplashImageUrl(currentRow?.marketSplashAd?.imageInfo?.fileLink);
      setMarketingTypes(currentRow?.type?.split(',') || []);
      generateFileList(currentRow?.marketVideo?.videoInfo);
      generateAdImagesThumbnail();
    }
  }, [visible]);

  return (
    <ModalForm
      formRef={formRef}
      title={
        <Typography.Title level={5} style={{ margin: 0 }}>
          {!!currentRow
            ? intl.formatMessage({ id: 'pages.marketing.edit-marketing' })
            : intl.formatMessage({ id: 'pages.marketing.add-marketing' })}
        </Typography.Title>
      }
      open={visible}
      width={700}
      onOpenChange={onOpenChange}
      modalProps={{
        maskClosable: false,
        destroyOnClose: true,
        onCancel: () => closeModal(),
      }}
      labelCol={{ span: 7 }}
      wrapperCol={{ span: 16 }}
      layout="horizontal"
      submitter={{
        searchConfig: {
          submitText: intl.formatMessage({ id: 'button.save' }),
        },
      }}
      onFinish={async (v) => handleSubmit(v)}
      initialValues={{
        name: currentRow?.name,
        apps: currentRow?.apps?.map((x) => x.id),
        status: currentRow?.status,
        splashUrl: currentRow?.marketSplashAd?.url,
        splashButtonName: currentRow?.marketSplashAd?.buttonName,
        videoTitle: currentRow?.marketVideo?.title,
        videoUrl: currentRow?.marketVideo?.url,
        types: currentRow?.type.split(','),
        splashRemarks: currentRow?.marketSplashAd?.remarks,
        videoRemarks: currentRow?.marketVideo?.remarks,
      }}
    >
      <ProFormText
        name="name"
        label={intl.formatMessage({ id: 'pages.marketing.marketing-name' })}
        rules={[{ required: true }]}
        fieldProps={{
          maxLength: 25,
        }}
      />
      <Spin spinning={appLoading}>
        <ProFormSelect
          style={{visibility: 'hidden'}}
          name="apps"
          mode="multiple"
          label={intl.formatMessage({ id: 'pages.app.app' })}
          // rules={[{ required: true }]}
          request={fetchMarketingApps}
        />
      </Spin>

      <ProFormSelect
        name="types"
        mode="multiple"
        label={intl.formatMessage({ id: 'pages.common.types' })}
        onChange={(v: string[]) => setMarketingTypes(v)}
        request={async () => {
          try {
            const { data } = await marketTypes();
            return data.map((type: string) => {
              return {
                label: intl.formatMessage({ id: `pages.marketing.${type.toLowerCase()}` }),
                value: type,
              };
            });
          } catch (e) {
            console.error(e);
            return [];
          }
        }}
        valueEnum={{
          [MARKETING_TYPES.BANNER]: intl.formatMessage({ id: 'pages.marketing.banner' }),
          [MARKETING_TYPES.SPLASH]: intl.formatMessage({ id: 'pages.marketing.splash' }),
          [MARKETING_TYPES.VIDEO]: intl.formatMessage({ id: 'pages.marketing.video' }),
        }}
        rules={[{ required: true }]}
      />

      {marketingTypes.includes(MARKETING_TYPES.BANNER) ? (
        <div id="marketingAds">
          <Typography.Title level={5}>
            {intl.formatMessage({ id: 'pages.marketing.banner' })}
          </Typography.Title>
          <Divider style={{ marginTop: '10px' }} />

          <Form.List name="images" initialValue={setAdImagesInitial()}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ flexGrow: '1' }}>
                        <Form.Item hidden noStyle name={[name, 'id']}>
                          <ProFormText />
                        </Form.Item>
                        <Form.Item noStyle {...restField} name={[name, 'image']}>
                          {imageUrl[name] ? (
                            <>
                              <Form.Item
                                label={intl.formatMessage({
                                  id: 'component.marketing.image-label',
                                })}
                              >
                                <img
                                  src={imageUrl[name]}
                                  alt="avatar"
                                  style={{ width: '100%', objectFit: 'contain' }}
                                />
                              </Form.Item>
                              {/* <Form.Item label=" " colon={false}>
                                <Typography.Text>
                                  {intl.formatMessage({ id: 'component.marketing.upload-label' })}
                                </Typography.Text>
                              </Form.Item> */}
                            </>
                          ) : (
                            <ProFormUploadButton
                              fileList={fileList}
                              accept=".jpg,.jpeg,.png,.gif"
                              label={intl.formatMessage({ id: 'component.marketing.image-label' })}
                              fieldProps={{
                                listType: 'picture-card',
                                beforeUpload: (v) => imageValidation(v),
                              }}
                              max={1}
                              icon={<PlusOutlined />}
                              title={false}
                              addonAfter={intl.formatMessage(
                                { id: 'component.marketing.upload-label' },
                                {
                                  fileSize: convertFileSize(307_200, undefined, true),
                                },
                              )}
                              onChange={(v) => handleImageChange(v, name)}
                            />
                          )}
                        </Form.Item>
                        <ProFormText
                          name={[name, 'url']}
                          label={intl.formatMessage({ id: 'component.marketing.url' })}
                          fieldProps={{
                            maxLength: 100,
                            placeholder: 'https://www.google.com',
                          }}
                          rules={[
                            {
                              pattern: /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
                              message: intl.formatMessage({ id: 'error.invalid-url' }),
                            },
                          ]}
                        />
                        <ProFormTextArea
                          name={[name, 'remarks']}
                          fieldProps={{
                            maxLength: 100,
                          }}
                          label={intl.formatMessage({ id: 'pages.common.remarks' })}
                        />
                      </div>
                      <CloseCircleOutlined
                        style={{ fontSize: '20px', color: '#0000003' }}
                        onClick={() => removeRow(name, remove)}
                      />
                    </div>
                  </div>
                ))}
                <Form.Item label=" " colon={false}>
                  <Typography.Text type="secondary">
                    {intl.formatMessage(
                      { id: 'component.marketing.image-count' },
                      { n: fields.length },
                    )}
                  </Typography.Text>
                </Form.Item>
                {fields.length < 5 && (
                  <Form.Item label=" " colon={false}>
                    <Button
                      type="dashed"
                      onClick={() => {
                        add();
                        setImageUrl((prev: any) => {
                          return [...prev, ''];
                        });
                      }}
                      block
                      icon={<PlusOutlined />}
                    >
                      {intl.formatMessage({ id: 'component.marketing.add-images' })}
                    </Button>
                  </Form.Item>
                )}
              </>
            )}
          </Form.List>
        </div>
      ) : null}

      {marketingTypes.includes(MARKETING_TYPES.SPLASH) ? (
        <div id="marketingSplash">
          <Typography.Title level={5}>
            {intl.formatMessage({ id: 'pages.marketing.splash' })}
          </Typography.Title>
          <Divider style={{ marginTop: '10px' }} />
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ flexGrow: '1' }}>
              <Form.Item noStyle name="splashImage">
                {splashImageUrl ? (
                  <>
                    <Form.Item
                      label={intl.formatMessage({ id: 'component.marketing.splash-image-label' })}
                    >
                      <img
                        src={splashImageUrl}
                        alt="avatar"
                        style={{ width: '50%', objectFit: 'contain' }}
                      />
                      <CloseCircleOutlined
                        style={{
                          position: 'absolute',
                          top: 0,
                          margin: '0 0 0 5px',
                          fontSize: '20px',
                          color: '#0000003',
                        }}
                        onClick={() => {
                          setSplashFileList([]);
                          setSplashImageUrl(null);
                        }}
                      />
                    </Form.Item>
                    {/* <Form.Item label=" " colon={false}>
                      <Typography.Text>
                        {intl.formatMessage({ id: 'component.marketing.upload-label' })}
                      </Typography.Text>
                    </Form.Item> */}
                  </>
                ) : (
                  <ProFormUploadButton
                    fileList={splashFileList}
                    accept=".jpg,.jpeg,.png,.gif"
                    label={intl.formatMessage({ id: 'component.marketing.splash-image-label' })}
                    fieldProps={{
                      listType: 'picture-card',
                      beforeUpload: (v) => imageValidation(v), // 400, 700
                    }}
                    max={1}
                    icon={<PlusOutlined />}
                    title={false}
                    addonAfter={intl.formatMessage(
                      { id: 'component.marketing.upload-label' },
                      {
                        fileSize: convertFileSize(307_200, undefined, true),
                      },
                    )}
                    onChange={(v) => handleSplashImageChange(v)}
                  />
                )}
              </Form.Item>
              <ProFormText
                name="splashUrl"
                label={intl.formatMessage({ id: 'component.marketing.url' })}
                fieldProps={{
                  maxLength: 100,
                  placeholder: 'https://www.google.com',
                }}
                rules={[
                  {
                    pattern: /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
                    message: intl.formatMessage({ id: 'error.invalid-url' }),
                  },
                ]}
              />
              <ProFormText
                name="splashButtonName"
                label={intl.formatMessage({ id: 'component.marketing.button-name' })}
                fieldProps={{
                  maxLength: 25,
                }}
              />
            </div>
          </div>
          <ProFormTextArea
            name="splashRemarks"
            fieldProps={{
              maxLength: 100,
            }}
            label={intl.formatMessage({ id: 'pages.common.remarks' })}
          />
        </div>
      ) : null}

      {marketingTypes.includes(MARKETING_TYPES.VIDEO) ? (
        <div id="marketingVideo">
          <Typography.Title level={5}>
            {intl.formatMessage({ id: 'pages.marketing.video' })}
          </Typography.Title>
          <Divider style={{ marginTop: '10px' }} />

          <ProFormUploadButton
            initialValue={videoList}
            fileList={videoList}
            accept=".mp4"
            name="video"
            label={intl.formatMessage({ id: 'component.marketing.video-label' })}
            fieldProps={{
              listType: 'picture-card',
              beforeUpload: () => false,
            }}
            max={1}
            icon={<PlusOutlined />}
            title={false}
            addonAfter={intl.formatMessage(
              { id: 'component.marketing.video-addon' },
              {
                fileSize: convertFileSize(307_200, undefined, true),
              },
            )}
            onChange={handleVideoChange}
          />
          <ProFormText
            name="videoTitle"
            label={intl.formatMessage({ id: 'component.marketing.title' })}
            fieldProps={{
              maxLength: 50,
            }}
          />
          <ProFormText
            name="videoUrl"
            label={intl.formatMessage({ id: 'component.marketing.url' })}
            fieldProps={{
              maxLength: 100,
              placeholder: 'https://www.google.com',
            }}
            rules={[
              {
                pattern: /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
                message: intl.formatMessage({ id: 'error.invalid-url' }),
              },
            ]}
          />
          <ProFormTextArea
            name="videoRemarks"
            fieldProps={{
              maxLength: 100,
            }}
            label={intl.formatMessage({ id: 'pages.common.remarks' })}
          />
          <Form.Item label=" " colon={false}>
            <Typography.Text type="secondary">
              {intl.formatMessage(
                { id: 'component.marketing.video-count' },
                { n: videoList.length },
              )}
            </Typography.Text>
          </Form.Item>
        </div>
      ) : null}
    </ModalForm>
  );
};

export default MarketingForm;
