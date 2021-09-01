/**
 * * 两个input数字输入框
 * * 默认 输入正整数, 无小数位
 */
import React, { useState, useEffect } from 'react';
import { InputNumber, Space, Tooltip } from 'antd';

interface InputRangeProps {
  value?: [number, number];
  onChange?: (value?: [number | undefined, number | undefined]) => void;
  id?: string;
}

const InputRange: React.FC<InputRangeProps> = (props) => {
  const { id, value, onChange, ...fieldProps } = props;

  const [startVal, setStartVal] = useState<number | undefined>(value ? value[0] : undefined);
  const [endVal, setEndVal] = useState<number | undefined>(value ? value[1] : undefined);

  useEffect(() => {
    if (startVal === undefined && endVal === undefined) {
      onChange && onChange(undefined);
    } else {
      onChange && onChange([startVal, endVal]);
    }
  }, [startVal, endVal]);

  // change事件
  const handleChange = (value: number | null, type: string) => {
    const val = value === null ? undefined : value;
    if (type === 'start') {
      setStartVal(val);
    } else if (type === 'end') {
      setEndVal(val);
    }
  };

  return (
    <>
      <Space size={3} split={<span> ~ </span>}>
        <Tooltip trigger={['focus']} title={startVal || '请输入数字'} placement="topLeft">
          <InputNumber precision={0} {...fieldProps} value={startVal} onChange={(val) => handleChange(val, 'start')} id={`${id}_start`} />
        </Tooltip>
        <Tooltip trigger={['focus']} title={endVal || '请输入数字'} placement="topLeft">
          <InputNumber precision={0} {...fieldProps} value={endVal} onChange={(val) => handleChange(val, 'end')} id={`${id}_end`} />
        </Tooltip>
      </Space>
    </>
  );
};

export default InputRange;
