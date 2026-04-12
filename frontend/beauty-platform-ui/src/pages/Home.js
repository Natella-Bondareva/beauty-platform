import { useEffect } from "react";
import { api } from "../api/client";

export default function Home() {
  useEffect(() => {
    api.get("/test").then(res => console.log(res.data));
  }, []);

  return <h1>Check console 👀</h1>;
}