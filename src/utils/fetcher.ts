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

  const walletToken =
    JSON.parse(localStorage.getItem("walletToken")!) || undefined;

  if (method.toLowerCase() !== "get") {
    requestHeader.append("Content-Type", "application/json");
  }

  if (walletToken) {
    requestHeader.append("Authorization", `Bearer ${walletToken}`);
  }

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
    if (error instanceof Error) {
      console.log("error", error);
      if (error.message === "Invalid token!") {
        localStorage.removeItem("walletToken");
      }
    }
  }
};

export default fetcher;
