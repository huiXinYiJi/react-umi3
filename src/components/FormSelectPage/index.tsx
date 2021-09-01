/**
 * * select下拉框 远程搜索 + 分页
 */
import React, { useState, useEffect, useRef } from 'react';
import { Form, Select, Pagination, Spin, Divider } from 'antd';
import type { PaginationProps } from 'antd/lib/pagination';
import type { SelectProps } from 'rc-select';
import type { ProFormSelectProps } from '@ant-design/pro-form/lib/components/Select';
import { resetDataToSelect } from '@/utils';
import { debounce } from 'lodash-es';

type OptionsType = SelectProps<any>['options'];

type SelectPageProps = {
  /** 重新触发的时机 request的传参*/
  params?: any;
  /** 分页*/
  paginationProps?: {
    current: number;
    pageSize: number;
  };
  /** 从服务器读取选项 返回符合select option的数据结构 value label */
  requestFuc: (params?: any) => Promise<any>; //  SelectProps<any>['options'];
  keywordName?: string;
  valueName?: string | number;
  labelName?: string | number;
  debounceTimeout?: number;
} & ProFormSelectProps;

interface SearchPageType extends PaginationProps {
  keyword: string;
}

const FormSelectPage: React.FC<SelectPageProps> = (props) => {
  const {
    keywordName,
    valueName,
    labelName,
    params,
    paginationProps,
    debounceTimeout = 300,
    fieldProps,
    requestFuc,
    width,
    ...rest
  } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<OptionsType>([]);
  const [searchPage, setSearchPage] = useState<SearchPageType>({
    current: paginationProps?.current || 1,
    pageSize: paginationProps?.pageSize || 20,
    keyword: '',
  });
  const [total, setTotal] = useState<number>(0);
  const lock = useRef(false); // 中文输入法判断
  const fetchRef = React.useRef(0); // 请求数量

  useEffect(() => {
    debounceFetcher(searchPage);
  }, [searchPage, params]);

  // 搜索
  const handleSearch = (value: string) => {
    // console.log('Search:', value, lock.current);
    if (!lock.current) {
      setSearchPage((prev) => ({
        ...prev,
        current: 1,
        keyword: value,
      }));
    }
  };

  const onPageChange = (page: number, pageSize?: number) => {
    console.log(page, pageSize);
    setSearchPage((prev) => ({
      ...prev,
      current: page,
      pageSize,
    }));
  };

  // 获取客户列表
  const handleFetch = async (searchPage: SearchPageType) => {
    fetchRef.current += 1;
    const fetchId = fetchRef.current;

    setLoading(true);
    const kName = keywordName || 'keyword';
    const { current, pageSize, keyword } = searchPage;
    let sendParams = {
      current: current,
      pageSize,
      [kName]: keyword,
    };
    params !== undefined && (sendParams = Object.assign({}, sendParams, params));
    try {
      // console.log('fetch: ', keyword);
      const res: API.ApiDataType<any> = await requestFuc(sendParams);
      // console.log(fetchId, fetchRef.current);
      if (fetchId !== fetchRef.current) {
        // for fetch callback order
        return;
      }
      setLoading(false);
      if (res.code === 200) {
        const data = res.data.hasOwnProperty('lists') ? res.data.lists : res.data;
        const valKey = valueName || 'value';
        const labelKey = labelName || 'label';
        setOptions(resetDataToSelect(data, { label: labelKey, value: valKey }));
        const count = res.data.hasOwnProperty('count') ? res.data.count : 0;
        setTotal(count);
      }
    } catch (err) {
      setLoading(false);
      console.log('src/components/FormSelectPage; 错误: 获取列表：', err);
      return false;
    }
  };

  const debounceFetcher = React.useMemo(() => {
    return debounce(handleFetch, debounceTimeout);
  }, [requestFuc, debounceTimeout, params]);

  //* 监听中文输入法
  const compositionListener = (e: CompositionEvent) => {
    console.log(e.type, 111, (e.target as HTMLInputElement).value);
    if (e.type === 'compositionstart') {
      lock.current = true;
      return;
    }
    if (e.type === 'compositionend') {
      lock.current = false;
      handleSearch((e.target as HTMLInputElement).value as string);
    }
  };

  const handleClear = () => {
    setSearchPage((prev) => ({
      ...prev,
      current: 1,
      keyword: '',
    }));
  };

  return (
    <>
      <Form.Item {...rest}>
        <Select
          className={width !== undefined || typeof width !== 'number' ? `pro-field-${width}` : ''}
          loading={loading}
          notFoundContent={loading ? <Spin size="small" /> : fieldProps?.notFoundContent}
          key="FormSelectPage"
          allowClear
          style={{ minWidth: '100%' }}
          placeholder={props?.placeholder || '请选择'}
          filterOption={false}
          showSearch
          onSearch={handleSearch}
          onFocus={(e) => {
            const inpuEle = e.target;
            if (!inpuEle.getAttribute('data-events')) {
              // 未绑定事件判断，避免重复绑定
              inpuEle.addEventListener('compositionstart', compositionListener);
              inpuEle.addEventListener('compositionend', compositionListener);
              inpuEle.setAttribute('data-events', 'composition');
            }
          }}
          onClear={handleClear}
          {...fieldProps}
          dropdownRender={(originNode: React.ReactNode) => (
            <div>
              {originNode}
              {total ? (
                <>
                  <Divider style={{ margin: '4px 0' }} />
                  <Pagination
                    className="select-page"
                    hideOnSinglePage
                    {...paginationProps}
                    current={searchPage.current}
                    pageSize={searchPage.pageSize}
                    onChange={onPageChange}
                    total={total}
                    size="small"
                  />
                </>
              ) : null}
            </div>
          )}
          options={options}
        ></Select>
      </Form.Item>
    </>
  );
};

export default FormSelectPage;
