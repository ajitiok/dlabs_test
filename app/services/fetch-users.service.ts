import apiClient from "@/utils/api";

type Params = {
  sortBy: string;
  order: string;
};

type Response = {
  users: {
    id: number;
    firstName: string;
    lastName: string;
    maidenName: string;
    age: number;
    gender: string;
    email: string;
    username: string;
    height: number;
    weight: number;
    role: string;
  }[];
  total: number;
  skip: number;
  limit: number;
};

export const fetchUsers = async (params: Params) => {
  const { data } = await apiClient.get<Response>("users?limit=5", {
    params,
  });

  return data;
};
