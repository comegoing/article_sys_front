import { notification } from "ant-design-vue";

// 判断是否是自然数
export function isNaturalNumber(str) {
  // 包含 0 的自然数：0, 1, 2, 3, ...
  return /^(0|[1-9]\d*)$/.test(str);
}

// 空值检查函数
export function isEmpty(value) {
  // 检查 null 和 undefined
  if (value === null || value === undefined) return true;

  // 检查字符串（包含空白字符）
  if (typeof value === "string") return value.trim() === "";

  // 检查数组
  if (Array.isArray(value)) return value.length === 0;

  // 检查对象
  if (typeof value === "object") return Object.keys(value).length === 0;

  // 其他类型
  return false;
}

// 通知信息
export function openMessage(title, describe, time) {
  return notification.open({
    message: title,
    description: describe,
    duration: time || 3,
  });
}
