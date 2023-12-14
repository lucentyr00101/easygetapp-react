import { Skeleton } from 'antd';

import styles from './style.less';

export type PageHeaderCardType = {
  name: string | boolean;
  avatar: string;
  id: string | number;
  desc?: () => React.ReactNode;
  uploadComponent?: () => React.ReactNode;
};

const PageHeaderCard: React.FC<{
  content: Partial<PageHeaderCardType>;
  style?: React.CSSProperties;
  extra?: React.ReactNode;
  isAvatar?: boolean;
}> = (props) => {
  const { content, style, extra, isAvatar } = props;
  const loading = content && Object.keys(content).length;
  if (!loading) {
    return <Skeleton avatar paragraph={{ rows: 1 }} active />;
  }
  return (
    <div
      className={styles.pageHeaderCard}
      style={{
        ...style,
      }}
    >
      {isAvatar && (
        <div className={styles.avatar}>
          <img src={content.avatar} />
        </div>
      )}
      {!isAvatar && content.uploadComponent?.()}
      <div className={styles.content}>
        {content.name && <div className={styles.contentTitle}>{content.name}</div>}
        {content.desc && <div className={styles.contentDesc}>{content.desc()}</div>}
      </div>
      <div className={styles.extra}>{extra}</div>
    </div>
  );
};

PageHeaderCard.defaultProps = {
  isAvatar: true,
};

export default PageHeaderCard;
