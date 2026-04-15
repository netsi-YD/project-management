import api from "./axios";

export const getAccessStatus = async () => {
  const res = await api.get("/guest/access-status");
  return res.data;
};

export const submitAccessRequest = async () => {
  const res = await api.post("/guest/request-access");
  return res.data;
};

export const getGuestProjects = async () => {
  const res = await api.get("/guest/projects");
  return res.data;
};
