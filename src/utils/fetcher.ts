declare type MethodType =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "get"
  | "post"
  | "put"
  | "post";

const fetcher = async (
  url: string,
  method: MethodType = "GET",
  data: object = {}
) => {
  const requestHeader = new Headers();

  /* const LocalUser: LoginDto =
    JSON.parse(localStorage.getItem("auth")!) || undefined; */

  if (method.toLowerCase() !== "get") {
    requestHeader.append("Content-Type", "application/json");
  }

  /* if (LocalUser) {
    requestHeader.append("Authorization", `Bearer ${LocalUser.token}`);
  } */

  const params: RequestInit = {
    headers: requestHeader,
    method,
    cache: "default",
  };

  if (method.toLowerCase() !== "get") {
    params.body = JSON.stringify(data);
  }

  const URL = `http://localhost:3001${url}`;

  try {
    const response = await fetch(URL, params);
    const responseData = await response.json();
    return responseData?.data || responseData?.status;
  } catch (error) {
    console.log("error", error);
  }
};

export default fetcher;
