import api from "../api/axios";

export const studentLogin = (data) => {
  return api.post("/auth/student/login", data);
};

export const adminLogin = (data) => {
  return api.post("/auth/admin/login", data);
};
