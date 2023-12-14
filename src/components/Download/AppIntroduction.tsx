import type { Details } from '@/pages/download';
import { useIntl } from '@umijs/max';
import { Carousel, Image, Typography } from 'antd';
import type { FC } from 'react';

const { Text, Title } = Typography;

interface Props {
  details: Details | undefined;
}

const AppIntro: FC<Props> = ({ details }) => {
  const intl = useIntl();

  return (
    <div className="download__app-intro">
      <Title level={3}>{intl.formatMessage({ id: 'pages.download.app-intro' })}</Title>
      <div>
        <Text>{details?.appIntroduction.text}</Text>
      </div>
      <Title level={3}>{intl.formatMessage({ id: 'component.app.releaseNotes' })}</Title>
      <div>
        <Text>{details?.appIntroduction.releaseNotes}</Text>
      </div>
      <div style={{ marginTop: '20px' }}>
        <Carousel
          autoplay
          waitForAnimate
          centerMode={true}
          autoplaySpeed={2000}
          slidesToShow={details?.appIntroduction?.images.length > 1 ? 2 : 1}
          responsive={[
            {
              breakpoint: 500,
              settings: {
                slidesToShow: 1,
                infinite: true,
                dots: true,
              },
            },
          ]}
          dots={{
            className: 'dots-class',
          }}
        >
          {details?.appIntroduction.images.map((image: any, index: any) => {
            return <Image key={index} src={image} />;
          })}
        </Carousel>
      </div>
    </div>
  );
};

export default AppIntro;
