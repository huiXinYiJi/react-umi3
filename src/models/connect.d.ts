import type { AppStateType } from 'umi';
import type { NodeStateType } from '@/pages/systems/node/model';
import type { RoleStateType } from '@/pages/systems/role/model';
import type { AdminStateType } from '@/pages/systems/admin/model';
import type { CompanyStateType } from '@/pages/systems/company/model';
import type { CustomerStateType } from '@/pages/customer/list/model';
import type { OrderStateType } from '@/pages/order/list/model';
import type { ProductListStateType } from '@/pages/product/list/model';
import type { ProducCateStateType } from '@/pages/product/cate/model';
import type { PhoneRecordStateType } from '@/pages/customer/PhoneRecord/model';
import type { LogStateType } from '@/pages/log/model';
import type { SourceStateType } from '@/pages/customer/source/model';
import type { ImportStateType } from '@/pages/import/model';

export type Loading = {
  global: boolean;
  effects: Record<string, boolean | undefined>;
  models: {
    app?: boolean;
    node?: boolean;
    role?: boolean;
    adminRole?: boolean;
    company?: boolean;
    customer?: boolean;
    order?: boolean;
    productList?: boolean;
    productCate?: boolean;
    phoneRecord?: boolean;
    log?: boolean;
    source?: boolean;
    import?: boolean;
  };
};

export type ConnectState = {
  loading: Loading;
  app: AppStateType;
  node: NodeStateType;
  role: RoleStateType;
  adminRole: AdminStateType;
  company: CompanyStateType;
  customer: CustomerStateType;
  order: OrderStateType;
  productList: ProductListStateType;
  productCate: ProducCateStateType;
  phoneRecord: PhoneRecordStateType;
  log: LogStateType;
  source: SourceStateType;
  import: ImportStateType;
};
