// 获取时间封装问候语
export const getTime = (): string => {
  let message = "";
  // 获取当前时间，使用中国标准时间（CST）
  const date = new Date();
  const hours = date.getUTCHours() + 8; // UTC 转 CST（中国标准时间）
  const adjustedHours = hours >= 24 ? hours - 24 : hours; // 超过 24 小时归零

  if (adjustedHours < 12) {
    message = "早上好";
  } else if (adjustedHours >= 12 && adjustedHours < 18) {
    message = "下午好";
  } else {
    message = "晚上好";
  }

  return message;
};

// 输入数字，正数表示未来日期，负数表示过去日期，返回一个数组，包含 num 个日期，格式为 YYYYMMDD
export function getRelativeDates(num: number) {
  const dates = [];

  // 遍历获取前 num 天或后 num 天的日期
  for (let i = 0; i < Math.abs(num); i++) {
    const date = new Date();
    // 根据 num 的正负，调整日期
    date.setDate(date.getDate() + (num > 0 ? i : -i)); // 如果 num > 0, 获取未来日期；如果 num < 0, 获取过去日期
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始，所以要加1，并且补齐两位
    const day = String(date.getDate()).padStart(2, "0"); // 补齐两位数字
    dates.push(`${year}${month}${day}`); // 添加日期到数组，格式为 YYYYMMDD
  }

  return dates; // 返回所有的日期数组
}

// 封装一个方法来格式化日期为 "yyyy-MM-dd HH:mm:ss" 格式
export function formatDateToSimple(dateString: string) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 确保月份两位数
  const day = date.getDate().toString().padStart(2, "0"); // 确保日期两位数
  const hours = date.getHours().toString().padStart(2, "0"); // 确保小时两位数
  const minutes = date.getMinutes().toString().padStart(2, "0"); // 确保分钟两位数
  const seconds = date.getSeconds().toString().padStart(2, "0"); // 确保秒数两位数

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function toDateStr(srcDate: Date | undefined, simpleFormat: boolean = false) {
  let date = srcDate || new Date();
  let year = date.getFullYear();
  let month = "00" + (date.getMonth() + 1);
  month = month.slice(-2);
  let day = "00" + date.getDate();
  day = day.slice(-2);
  let hour = "00" + date.getHours();
  hour = hour.slice(-2);
  let minutes = "00" + date.getMinutes();
  minutes = minutes.slice(-2);
  let seconds = "00" + date.getSeconds();
  seconds = seconds.slice(-2);

  if (simpleFormat) {
    return year + "-" + month + "-" + day;
  }

  return (
    year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds
  );
}

// 零时区
export const zeroTime = (dateString: string) => {
  return dateString.replace(/[.].*$/g, "")
}