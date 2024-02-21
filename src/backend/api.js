import axios from "axios";
const instance = axios.create({
  //本地
  baseURL: import.meta.env.VITE_key,
  timeout: 50000,
});


export const Get_pics = () => instance.get("/Pic");

//export const Get_photo = (e) => instance.post("/Pic/photo",e,{responseType: 'arraybuffer'});
export const Get_photo = (e) => instance.post("/Pic/photo",e);

export const Up_config = (e) => instance.get(`/config?path=${e}`);