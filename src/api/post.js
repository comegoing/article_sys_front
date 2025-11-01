const url = "http://127.0.0.1:5000";
import axios from "axios";
// 查询所有账户信息
export async function searchPapers(data) {
  const response = await axios.post(`${url}/api/ArxivTranslator`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log("收到响应:", response);
  console.log("响应数据:", response.data);
  return response.data;
}
