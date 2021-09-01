import dayjs from 'dayjs';

//*时间区间组件 默认时分秒
export const timeRangeFieldProps = (fieldProps?: any) => {
  return (
    fieldProps || {
      showTime: {
        defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('11:59:59', 'HH:mm:ss')],
      },
    }
  );
};
