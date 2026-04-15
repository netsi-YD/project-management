export const getPublicProjects = async () => {
  const response = await fetch("http://localhost:8000/api/projects");
  const data = await response.json();
  return data;
};
