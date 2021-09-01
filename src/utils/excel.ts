import XLSX from 'xlsx';
import type { WritingOptions } from 'xlsx';
import { downloadFile } from './index';

type rowType = { [key: string]: string | number };

const wopts: WritingOptions = {
  bookType: 'xlsx',
  bookSST: false,
  type: 'binary',
};
const workBook = {
  SheetNames: ['Sheet1'],
  Sheets: {
    Sheet1: {},
  },
  Props: {},
};

//* json转excel
export function json2Excel(dataSource: { [key: string]: any }[]) {
  //1、XLSX.utils.json_to_sheet(data) 接收一个对象数组并返回一个基于对象关键字自动生成的“标题”的工作表，默认的列顺序由使用Object.keys的字段的第一次出现确定
  //2、将数据放入对象workBook的Sheets中等待输出
  workBook.Sheets['Sheet1'] = XLSX.utils.json_to_sheet(dataSource);
  //3、XLSX.write() 开始编写Excel表格
  //4、changeData() 将数据处理成需要输出的格式
  downloadFile(
    new Blob([changeData(XLSX.write(workBook, wopts))], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
  );
}

function changeData(s: string) {
  //如果存在ArrayBuffer对象(es6) 最好采用该对象
  if (typeof ArrayBuffer !== 'undefined') {
    //1、创建一个字节长度为s.length的内存区域
    var buf = new ArrayBuffer(s.length);
    //2、创建一个指向buf的Unit8视图，开始于字节0，直到缓冲区的末尾
    var view = new Uint8Array(buf);
    //3、返回指定位置的字符的Unicode编码
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  } else {
    var buf2 = new Array(s.length) as any;
    for (var i = 0; i != s.length; ++i) buf2[i] = s.charCodeAt(i) & 0xff;
    return buf2;
  }
}

//* 解析excel数据
/** 使用：
 * parseExcel(file)
 * .then((res) => {
 *   console.log('解析excel后的数据: ', res);
 * })
 * .catch((error) => {
 *   message.warning(error);
 * });
 * type rowType = Omit<API.ImportDetailType, 'id' | 'is_status'>;
 * excel中文字段对照
 * const ExcelContrast: { [key: string]: string } = {
 *   订单号: 'order_id',
 *   姓名: 'name',
 *   电话: 'phone',
 *   地址: 'address',
 *   商品编码: 'goods_code',
 *   商家编码: 'shop_code',
 *   数量: 'num',
 *   到付金额: 'arrive_pay',
 *   实收金额: 'receive_pay',
 *   订单备注: 'order_remark',
 *   来源: 'source',
 * };
 */
export const parseExcel = (file: Blob, ExcelContrast: { [key: string]: string }) => {
  return new Promise((resolve, reject) => {
    var fileReader = new FileReader(); //新建一个FileReader
    fileReader.readAsBinaryString(file); //读取文件
    fileReader.onload = function (evt: ProgressEvent<typeof fileReader>) {
      let data: { [key: string]: any }[] = [];
      if (evt.target) {
        let workbook = XLSX.read(evt.target.result, { type: 'binary' });
        if (workbook.SheetNames.length <= 0) {
          reject('您的文件没有内容!');
        }
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        data = data.concat(XLSX.utils.sheet_to_json(firstSheet));
        const result = resetData(data, ExcelContrast);
        resolve(result);
      } else {
        reject('文件读取失败!');
      }
    };
  });
};

//*  重构json数据
const resetData = (data: rowType[], ExcelContrast: { [key: string]: string }) => {
  const arr: rowType[] = [];
  const errorList: rowType[] = [];
  data.map((item, index) => {
    const obj = {} as rowType;
    for (let key in ExcelContrast) {
      const name = ExcelContrast[key];
      const value = item[key];
      if (value) {
        // column不为空
        let val: string | number | undefined = undefined;
        val = (value + '').replace(/^(\t)*(.*)(\t)*$/g, '$2');
        if (typeof value === 'number') {
          val = Number(val);
        }
        obj[name] = val;
      } else {
        obj[name] = '';
      }
    }
    arr.push(obj);
  });
  //*剔除column值为空的数据
  arr.map((item, index) => {
    Object.keys(item).map((el) => {
      if (item[el] === '') {
        arr.splice(index, 1);
        errorList.push(item);
      }
    });
  });
  return { success: arr, error: errorList };
};
