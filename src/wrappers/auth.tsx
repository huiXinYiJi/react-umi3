import { Redirect } from 'umi'
import { getToken } from '@/utils/cache'
import type { IRouteProps } from 'umi'

export default (props: IRouteProps) => {
  if (getToken()) {
    return <div>{ props.children }</div>
  } else {
    return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
  }
}