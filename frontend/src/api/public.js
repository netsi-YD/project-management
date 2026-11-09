import api from "./axios";

export const getPublicProjects = async () => {
  const response = await api.get("/projects");
  return response.data;
};
