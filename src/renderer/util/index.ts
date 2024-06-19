import dayjs from 'dayjs';
import weekday from "dayjs/plugin/weekday"
import localeData from "dayjs/plugin/localeData"
import 'dayjs/locale/zh-cn';

export function paramToString(obj) {
  let ret = "";
  if (Object.keys(obj).length > 0) {
    for (let _key in obj) {
      ret += _key + "=" + obj[_key] + "&"
    }
    ret = ret.substring(ret, ret.length - 1);
  }
  return ret;
}

export function paramToLines(params : Array<any>, length : number) {
  let ret = "";
  for (let key in params) {
    let value = ""
    if (!isStringEmpty(params[key])) {
      value = params[key].substring(0, length)
    }
    ret += key + "=" + value + "\n"
  }
  return ret;
}

export function isStringEmpty(str) {  
  return str === null || str === undefined || str.trim() === '';  
}

export function getNowdayjs() : dayjs.Dayjs {
  dayjs.locale('zh-cn'); 
  dayjs.extend(weekday)
  dayjs.extend(localeData)
  return dayjs();
}

export function getdayjs(timestamp : number) : dayjs.Dayjs  {
  dayjs.locale('zh-cn'); 
  dayjs.extend(weekday)
  dayjs.extend(localeData)
  return dayjs(timestamp);
}

export function getType(obj : any) {  
  return Object.prototype.toString.call(obj).slice(8, -1);  
}

export function removeWithoutGap(arr : Array<Object>, index : number) {  
  // 确保索引在数组范围内  
  if (index >= 0 && index < arr.length) {  
      // 使用后面的元素覆盖要删除的元素  
      for (let i = index; i < arr.length - 1; i++) {  
          arr[i] = arr[i + 1];  
      }  
      // 减少数组长度以删除最后一个元素（它现在是多余的）  
      arr.length--;  
  }  
  return arr;  
}