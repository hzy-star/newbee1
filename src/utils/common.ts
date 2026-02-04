
import { ElMessage } from 'element-plus'
import { reqDownloadUrl } from '@/api/docDownload/ossDownload'
// 使用 default 导出整个对象
export const toQueryStr = (src: any) => {
  var buffer = [];
  if (!src) return "";
  for (var i in src) {
    var v = src[i];
    if (v === null || v === undefined) {
    } else {
      if (v.substring) {
        buffer.push(i + "=" + encodeURIComponent(v));
      } else {
        buffer.push(i + "=" + encodeURIComponent(JSON.stringify(v)));
      }
    }
  }
  return buffer.join("&");
};

export const truncateText = (text: string, length?: number) => {
  if (!text) return ""; // 如果没有文本则返回空字符串
  return text.length > (length ?? 50) ? text.substring(0, (length ?? 50)) + "..." : text;
};
export const getCookies = ( name:string ) => {
  //accesscode=23b9edc3fb1a4f2c86ba700ba731b4b4; passcode=d2307f01c299485bbc1b6656b161d06
  var cookieArr =  document.cookie.split(";" );  
  for( var c in   cookieArr) {
      c=  cookieArr[ c] ;
      var citems =  c.split("=");
      var cname = citems[0].trim(); 
      if( cname == name ) {
          return citems[1] || null; 
      }
  }
  return null;
}

//**
// 0：非活跃时间送量
// 1: 活跃时间送量
// 2：pm定制送量
// 3：默认送量
//  */
export const sendTypefun = (data: string) => {
    switch (data) {
        case '0':
            return '非活跃时间送量';
        case '1':
            return '活跃时间送量';
        case '2':
            return 'pm定制送量';
        case '3':
            return '默认送量';
        default:
            return '';
    }
}


// 判断是否科学计数法
const isSci = (v: string | number) => /^[+-]?\d+(\.\d+)?e[+-]?\d+$/i.test(String(v).trim())

// 科学计数法 -> 普通数字字符串（字符串级移位，避免浮点误差）
export function sciToDecimalString(input: string | number): string {
  const str = String(input).trim()
  const m = /^([+-]?[\d.]+)e([+-]?\d+)$/i.exec(str)
  if (!m) return str
  let [, mantissa, expStr] = m
  const exponent = parseInt(expStr, 10)
  const sign = mantissa.startsWith('-') ? '-' : ''
  mantissa = mantissa.replace(/^[+-]/, '')
  const [i, f = ''] = mantissa.split('.')
  const digits = i + f

  if (exponent >= 0) {
    const pos = i.length + exponent
    return pos >= digits.length
      ? sign + digits + '0'.repeat(pos - digits.length)
      : sign + digits.slice(0, pos) + '.' + digits.slice(pos)
  } else {
    const pos = i.length + exponent
    return pos > 0
      ? sign + digits.slice(0, pos) + '.' + digits.slice(pos)
      : sign + '0.' + '0'.repeat(-pos) + digits
  }
}

// 是否可以删除算法配置中的数据
export function deleteAlgDataCheck(data:any,str?:string){
  if(data && data.isusing){
    ElMessage.warning(`该${str}正在使用中，无法删除`)
    return false
  }
  return true
}


// 下载csv文件封装
export async function handleDownload  (_s: any)  {
  const objectName = String(_s || '').trim()
  if (!objectName) {
    ElMessage.warning('规则文件路径为空，无法下载')
    return
  }
  try {
    // 获取完整响应对象
    const response = await reqDownloadUrl({ objectName: objectName });

    // 从响应头获取文件名
    const contentDisposition = response.headers['content-disposition'];
    const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/);
    const fileName = fileNameMatch ? fileNameMatch[1] : 'download.csv';

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName; // 使用后端返回的文件名
    link.style.display = 'none';

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理资源
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading URL:', error);
    ElMessage.error('文件路径不存在');
  }
}


/**
 * 四舍五入保留指定位小数
 * 如果是整数，直接返回整数
 */
export function roundIfNeeded(value:number, digits = 0) {
  if (typeof value !== 'number' || !isFinite(value)) {
    return NaN;
  }

  // 是整数，直接返回
  if (Number.isInteger(value)) {
    return value;
  }

  const factor = Math.pow(10, digits);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
