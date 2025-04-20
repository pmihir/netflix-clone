import axios from "axios";

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    accept: "application/json",
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3OTg5Yjk3YWU1YTM2MTFkNzg4ZmFmNjhlNTU4MTZhZiIsIm5iZiI6MTc0NDkwNjc5Ni4yMDg5OTk5LCJzdWIiOiI2ODAxMmEyYzRmNTljMjRjMGRhZDM3NDgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.wCyyOrUoQjO2Bqx_15Ac3sII9zEtdAuXl4tK1XrW_5o`,
  },
});

export default api;
