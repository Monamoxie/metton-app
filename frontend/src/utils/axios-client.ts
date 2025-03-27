import axios from "axios";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Add a response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response) {
//       const { status } = error.response;
//       if (status === 401 || status === 403) {
//         // showAuthErrorModal();
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// function showAuthErrorModal() {
//   const headerList = headers();
//   const pathname = headerList.get("x-current-path");
//   NextResponse.redirect(new URL("/"));
// }

export default axiosClient;
