/**
 * * 两个input数字输入框
 * * 默认 输入正整数, 无小数位
 */
import React, { useState, useEffect } from 'react';
import { Select, Space, DatePicker } from 'antd';
import type { RangePickerProps } from 'antd/lib/date-picker';
import type { SelectProps } from 'rc-select';
import styles from './index.less';
import dayjs from 'dayjs';
import type { DefaultValueType } from 'rc-select/lib/interface/generator';

const { RangePicker } = DatePicker;

interface InputRangeProps {
  value?: [string | number, [number, number]];
  onChange?: (value?: [string | number | undefined, [number, number] | undefined]) => void;
  id?: string;
}

const TimeRangeSelect: React.FC<InputRangeProps> = (props) => {
  const { id, value, onChange, ...fieldProps } = props;
  const { selectProps, timeProps } = fieldProps as {
    selectProps: { width: number } & SelectProps;
    timeProps: RangePickerProps;
  };
  const { width = 150, options, ...restSelectProps } = selectProps;
  const [selectVal, setSelectVal] = useState<string | number | undefined>(value ? value[0] : options![0].value);
  const [timeVal, setTimeVal] = useState<[number, number] | undefined>(value ? value[1] : undefined);

  useEffect(() => {
    onChange && onChange([selectVal, timeVal]);
  }, [selectVal, timeVal]);

  //*下拉框change事件
  const selectChange = (value: string | number | undefined) => {
    setSelectVal(value);
  };

  //*日期变化
  const handleDateChange = (dates: any) => {
    const time = [dayjs(dates[0]).valueOf(), dayjs(dates[1]).valueOf()] as [number, number];
    setTimeVal(time);
  };

  return (
    <>
      <Space size={0} className={styles.timeRangeSelect}>
        <div style={{ width }}>
          <Select
            value={selectVal}
            options={options || []}
            placeholder="请选择时间类型"
            {...restSelectProps}
            onChange={selectChange}
          ></Select>
        </div>
        <div>
          <RangePicker {...timeProps} onChange={handleDateChange} />
        </div>
      </Space>
    </>
  );
};

export default TimeRangeSelect;
