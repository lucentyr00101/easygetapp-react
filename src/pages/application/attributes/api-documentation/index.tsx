import { Card } from 'antd';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const APIDocumentation: React.FC = () => {
  const isProd = REACT_APP_ENV === 'production';

  return (
    <Card>
      <SwaggerUI url={`/ega-swagger-v1.0-${isProd ? 'production' : 'staging'}.yaml`} />
    </Card>
  );
};
export default APIDocumentation;
