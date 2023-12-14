import { useApplicationContext } from '@/contexts/application.context';
import {
  appDownloadHistoryStatistics,
  appDownloadHistoryStatisticsTopTen,
  dropdownAppVersions,
} from '@/services/api/app-management';
import { Line } from '@ant-design/charts';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { HeatmapLayer, MapboxScene, PointLayer } from '@antv/l7-react';
import { useIntl } from '@umijs/max';
import { Card, Col, DatePicker, Row, Select } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker/generatePicker';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';

type TopTenCoutryListItem = {
  id: string;
  country: string;
  downloadCount: string;
};

type RangePickerValue = RangePickerProps<moment.Moment>['value'];

const { RangePicker } = DatePicker;

const Statistics: React.FC = () => {
  const intl = useIntl();
  const tableRef = useRef<ActionType>();

  const [data, setData] = useState<any>();
  const [grid, setGrid] = useState<any>();
  const [lineData, setLineData] = useState<any>([]);
  const [dropdownAppVersion, setDropdownAppVersion] = useState([{}]);
  const [version, setVersion] = useState(intl.formatMessage({ id: 'dropdown.select.all.version' }));
  const [total, setTotal] = useState('0');
  const [maxLimit, setMaxLimit] = useState(5);

  const { currentApp } = useApplicationContext();
  const colors = ['#2171b5'];
  const today = new Date();
  const lastWeekOfCurrentDay = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate() - 11,
  );
  const [mapRangePickerValue, setMapRangePickerValue] = useState<RangePickerValue>([
    moment(lastWeekOfCurrentDay),
    moment(today),
  ]);

  const [lineRangePickerValue, setLineRangePickerValue] = useState<RangePickerValue>([
    moment(lastWeekOfCurrentDay),
    moment(today),
  ]);

  const columns: ProColumns<TopTenCoutryListItem>[] = [
    {
      title: 'Country Name',
      dataIndex: 'country',
      search: false,
    },
    {
      title: 'Downloads',
      dataIndex: 'downloadCount',
      search: false,
    },
  ];

  const config = {
    data: lineData,
    height: 400,
    xField: 'downloadDate',
    yField: 'Download Count',
    point: {
      size: 5,
      shape: 'diamond',
    },
    yAxis: {
      min: 0,
      tickCount: 6,
      maxLimit: maxLimit,
    },
  };

  const readGeoData = async () => {
    const [gridData] = await Promise.all([
      fetch(
        'https://gw.alipayobjects.com/os/bmw-prod/8990e8b4-c58e-419b-afb9-8ea3daff2dd1.json',
      ).then((d) => d.json()),
    ]);

    setGrid(gridData);
  };

  const fetchList = async () => {
    const { data } = await appDownloadHistoryStatisticsTopTen({
      appId: currentApp.id,
      fromDate: mapRangePickerValue && moment(mapRangePickerValue[0].$d).format('YYYY-MM-DD'),
      toDate: mapRangePickerValue && moment(mapRangePickerValue[1].$d).format('YYYY-MM-DD'),
    });

    const fetchListData = data.map((val: any) => {
      return val.properties;
    });

    const geoData = { type: 'FeatureCollection', features: data };
    setData(geoData);

    return Promise.resolve({
      data: fetchListData,
      success: true,
      totalPages: data?.totalPages,
      total: data?.totalElements,
    });
  };

  const fetchLineChartData = async () => {
    const { data } = await appDownloadHistoryStatistics({
      appId: currentApp.id,
      versionNumber: version,
      fromDate: lineRangePickerValue && moment(lineRangePickerValue[0].$d).format('YYYY-MM-DD'),
      toDate: lineRangePickerValue && moment(lineRangePickerValue[1].$d).format('YYYY-MM-DD'),
    });
    const totalDownload = data?.reduce((a, v) => a + v.downloadCount, 0);
    const maxLimit = (Math.floor(totalDownload / 5) + 1) * 5;
    setMaxLimit(maxLimit);
    setTotal(totalDownload);
    const formateLabelNameData = data.map((val) => {
      return { ...val, 'Download Count': val.downloadCount };
    });

    setLineData(formateLabelNameData);
  };

  const fetchDropdownAppVersion = async () => {
    const { data } = await dropdownAppVersions({
      id: currentApp.id,
    });

    const filterData = Array.from(new Set(data)).map((val: any) => {
      return {
        value: val,
        label:
          val === 'All Version' ? intl.formatMessage({ id: 'dropdown.select.all.version' }) : val,
      };
    });

    setDropdownAppVersion(filterData);
  };

  const handleVersionChange = (value: string) => {
    setVersion(value);
  };

  const handleMapRangePickerChange = (value: RangePickerValue) => {
    setMapRangePickerValue(value);
  };

  const handleLineRangePickerChange = (value: RangePickerValue) => {
    setLineRangePickerValue(value);
  };

  useEffect(() => {
    fetchLineChartData();
    fetchDropdownAppVersion();
  }, [currentApp, version, lineRangePickerValue]);

  useEffect(() => {
    readGeoData();
    fetchList();
    tableRef?.current?.reloadAndRest?.();
  }, [currentApp, mapRangePickerValue]);
  return (
    <>
      <Card style={{ marginBottom: '2rem' }} title={intl.formatMessage({ id: 'pages.statistics' })}>
        <Row justify="space-between">
          <Col>
            <h3 style={{ marginTop: 0 }}>
              {intl.formatMessage({ id: 'pages.statistics.totalDownloads' })}: {total}
            </h3>
          </Col>
          <Col style={{ marginBottom: '2rem' }}>
            <Select
              value={version}
              style={{ width: 120 }}
              onChange={handleVersionChange}
              options={dropdownAppVersion}
            />
            <RangePicker
              value={lineRangePickerValue}
              onChange={handleLineRangePickerChange}
              style={{ marginBottom: '3rem', marginLeft: '2rem' }}
            />
          </Col>
        </Row>
        <Line {...config} />
      </Card>
      <Card title={intl.formatMessage({ id: 'pages.statistics.downloadsByCountry' })}>
        <Row>
          <Col span={16}>
            <MapboxScene
              map={{
                center: [0, 35],
                pitch: 0,
                style: 'blank',
                zoom: 0.1,
              }}
              style={{
                position: 'relative',
                width: '100%',
                height: '452px',
              }}
            >
              {grid && (
                <HeatmapLayer
                  key="1"
                  source={{
                    data: grid,
                    transforms: [
                      {
                        type: 'hexagon',
                        size: 800000,
                        field: 'capacity',
                        method: 'sum',
                      },
                    ],
                  }}
                  color={{
                    values: '#ddd',
                  }}
                  shape={{
                    values: 'hexagon',
                  }}
                  style={{
                    coverage: 0.7,
                    opacity: 0.8,
                  }}
                />
              )}
              {data && [
                <PointLayer
                  key="2"
                  // options={{
                  //   autoFit: true,
                  // }}
                  source={{
                    data,
                  }}
                  scale={{
                    values: {
                      color: {
                        field: 'downloadCount',
                        type: 'quantile',
                      },
                      size: {
                        field: 'downloadCount',
                        type: 'log',
                      },
                    },
                  }}
                  color={{
                    field: 'downloadCount',
                    values: colors,
                  }}
                  shape={{
                    values: 'circle',
                  }}
                  active={{
                    option: {
                      color: '#0c2c84',
                    },
                  }}
                  size={{
                    field: 'downloadCount',
                    values: [50, 100],
                  }}
                  style={{
                    opacity: 0.8,
                  }}
                />,
                <PointLayer
                  key="5"
                  source={{
                    data,
                  }}
                  color={{
                    values: '#fff',
                  }}
                  shape={{
                    field: 'country',
                    values: 'text',
                  }}
                  size={{
                    values: 12,
                  }}
                  style={{
                    opacity: 1,
                    strokeOpacity: 1,
                    strokeWidth: 0,
                  }}
                />,
              ]}
            </MapboxScene>
          </Col>
          <Col span={8}>
            <RangePicker
              value={mapRangePickerValue}
              onChange={handleMapRangePickerChange}
              style={{ marginBottom: '3rem', marginLeft: '2rem' }}
            />
            <h3 style={{ textAlign: 'center' }}>
              {intl.formatMessage({ id: 'pages.statistics.top10Country' })}
            </h3>
            <ProTable<TopTenCoutryListItem>
              actionRef={tableRef}
              rowKey="id"
              search={false}
              headerTitle={false}
              columns={columns}
              options={false}
              pagination={false}
              request={fetchList}
            ></ProTable>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default Statistics;
