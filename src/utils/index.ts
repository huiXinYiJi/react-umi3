import { parse } from 'querystring';

/**
 * @description 解析页面路径参数
 * @returns object
 */
export const getPageQuery = () => parse(window.location.href.split('?')[1]);

/**
 * @description 扁平化对象数组
 * @param routes 原对象数组
 * @param key 要展开的子节点对应key名，默认 'children'
 * @param arr 新的对象数组，默认初始值为 []
 * @returns 展开后的数组
 */
export const flattenDeep = <T extends { [k: string]: any }>(routes: T[], key: keyof T = 'children', arr: T[] = []) => {
  routes.map((item: T) => {
    if (item[key]) {
      flattenDeep(item[key], key, arr);
      arr.push(item);
    } else {
      arr.push(item);
    }
  });
  return arr;
};

/**
 * @description 深度克隆
 * @param obj
 * @returns 新的对象
 */
export const cloneDeep = <T extends { hasOwnProperty: (key: string | number) => boolean }>(obj: T): T => {
  const newObj: T = Object.create(obj);
  if (obj && typeof obj === 'object') {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        newObj[key] = obj && typeof obj[key] === 'object' ? cloneDeep(obj[key]) : obj[key];
      }
    }
  }
  return newObj;
};

/**
 * @description 通过名称获取cookie
 * @param cookie_name string
 * @returns 获取对应cookie_name的值
 */
export function getCookie(cookie_name: string): string {
  var allcookies = document.cookie;
  //索引长度，开始索引的位置
  var cookie_pos = allcookies.indexOf(cookie_name);
  // 如果找到了索引，就代表cookie存在,否则不存在
  if (cookie_pos !== -1) {
    // 把cookie_pos放在值的开始，只要给值加1即可
    //计算取cookie值得开始索引，加的1为“=”
    cookie_pos = cookie_pos + cookie_name.length + 1;
    //计算取cookie值得结束索引
    var cookie_end = allcookies.indexOf(';', cookie_pos);

    if (cookie_end === -1) {
      cookie_end = allcookies.length;
    }
    //得到想要的cookie的值
    var value = unescape(allcookies.substring(cookie_pos, cookie_end));
    return value;
  }
  return '';
}

/**
 * @description 对象数组 转成 转 {label: sting | number; value: string | number;}
 * @param arr 对象数组
 * @param param1 {label, value} 转换后 label value的对应key
 * @returns 生成一个新的对象数组：新增label value键值对
 */
export const resetDataToSelect = <T>(arr: T[], { label, value }: { label: keyof T; value: keyof T }) => {
  return arr.reduce((prev: T[] & API.OptionsType[], cur) => {
    prev.push({
      ...cur,
      value: cur[value] as any,
      label: cur[label] as any,
    });
    return prev;
  }, []);
};

//* 下载文件 // xls/1627722899474459906.xlsx
export const downloadFile = (url: string | Blob, fileName?: string) => {
  const a = document.createElement('a');
  a.download = fileName || 'download';
  if (typeof url === 'string') {
    const host = window.location.origin;
    a.href = host + '/' + url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else if (url.type) {
    const urlObj = URL.createObjectURL(url);
    a.href = urlObj;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      //延时释放
      URL.revokeObjectURL(urlObj); //用URL.revokeObjectURL()来释放这个object URL
    }, 100);
  }
};

//* 生成唯一key
const __timeid_start__ = Date.now();
export const timeid = () => {
  return String(Date.now() - __timeid_start__) + String(Math.random());
};

/**
 * @description 数字转换
 * @param number 要格式化的数字
 * @param decimals 保留几位小数
 * @param dec_point 小数点符号
 * @param thousands_sep 千分位符号
 * @returns string 如： numberFormat(12567.089, 2, ".", ","); 返回 1,234,567.09
 */
export const numberFormat = (number: number, decimals: number = 2, dec_point: string = '.', thousands_sep: string = ',') => {
  const numberTrans: string = (number + '').replace(/[^0-9+-Ee.]/g, '');
  let n = !isFinite(+numberTrans) ? 0 : +numberTrans,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = typeof thousands_sep === 'undefined' ? ',' : thousands_sep,
    dec = typeof dec_point === 'undefined' ? '.' : dec_point,
    toFixedFix = function (n: number, prec: number) {
      var k = Math.pow(10, prec);
      return '' + Math.ceil(n * k) / k;
    };
  let s: string[] = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  var re = /(-?\d+)(\d{3})/;
  while (re.test(s[0])) {
    s[0] = s[0].replace(re, '$1' + sep + '$2');
  }

  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
};
