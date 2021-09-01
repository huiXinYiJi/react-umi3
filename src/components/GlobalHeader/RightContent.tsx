import UserDropdown from './UserDropdown';
import { Space } from 'antd';
// import { SelectLang } from 'umi';
import styles from './index.less';

const RightContent = () => {
  return (
    <div className={styles.rightContent}>
      <Space size={0}>
        <UserDropdown />
        {/* <SelectLang className={styles.action} /> */}
      </Space>
    </div>
  );
};
export default RightContent;
