export interface User {
  id: number;
  name: string;
  email: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export const getUser = async (id: number): Promise<User> => {
  const response = await fetch(`https://api.example.com/api/users/${id}`);
  return response.json();
};

export const createUser = async (data: CreateUserRequest): Promise<User> => {
  const response = await fetch('https://api.example.com/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};
