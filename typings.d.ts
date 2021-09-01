declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.jpg';
declare module '*.svg' {
  export function ReactComponent(props: React.SVGProps<SVGSVGElement>): React.ReactElement;
  const url: string;
  export default url;
}
declare module 'hoist-non-react-statics';
// 环境变量声明
declare const REACT_APP_PREFIX_URL: string;
declare const REACT_APP_TITLE: string;
declare const REACT_APP_WATERMASK: string;
declare const REACT_APP_BASE_URL: string;
declare const REACT_APP_WEBSITE: string;
declare const REACT_APP_FULL_TITLE: string;
interface Window {
  oldRender: (routes?: any) => void;
}
