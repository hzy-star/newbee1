// 封装公共方法
const  toQueryStr =(  src: any) =>{
    var  buffer = [];
    if ( !src ) return "";
    for ( var i in  src ) {
        var v = src[i];
        if ( v=== null || v=== undefined) {

        }else {
            if ( v.substring ) { 
            buffer.push(  i + "="+ encodeURIComponent( v ) );
            }else {
                buffer.push(  i + "="+ encodeURIComponent(  JSON.stringify( v ) )  );
            }
        }
    }
    return  buffer.join("&" );
}


export default {
    toQueryStr
}