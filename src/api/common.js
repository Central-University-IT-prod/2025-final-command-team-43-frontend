import axios from "axios";
import {BASE_API_URL} from "@/api/constants.js";

export function sendRequest(method, endpoint, data, headers, formData = null) {
    return axios.request({
      url: `${BASE_API_URL}/${endpoint}`,
      method: method,
      data: data,
      formData: formData,
      headers: headers,
    });
}
