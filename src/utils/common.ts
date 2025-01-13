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

export const truncateText = (text: string) => {
  if (!text) return ""; // 如果没有文本则返回空字符串
  return text.length > 50 ? text.substring(0, 50) + "..." : text;
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