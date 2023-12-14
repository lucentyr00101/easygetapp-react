import { Modal } from 'antd';
import type { FC } from 'react';

interface Props {
  open: boolean;
  link: string;
  cancel: () => void;
}

const QRModal: FC<Props> = ({ open, link, cancel }) => {
  return (
    <Modal open={open} onCancel={() => cancel()} footer={null} width={300}>
      <div style={{ textAlign: 'center' }}>
        <img width="250" src={link} alt="link" />
      </div>
    </Modal>
  );
};

export default QRModal;
