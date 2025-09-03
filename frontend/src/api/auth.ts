import axios from 'axios'

export const HOST = (import.meta as any).env.VITE_HOST || ''

export type User = {
  id: string,
  userName: string,
  role: string
}

export type LoginCheckResponse = {
  user?: User,
  authenticated: boolean,
  message?: string
}

export const checkLogin = async (): Promise<LoginCheckResponse> => {
  try {
    const res = await axios.get<LoginCheckResponse>(`${HOST}/api/users/login-check`, {
      withCredentials: true,
    });
    return res.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return { authenticated: false, message: error.response.data?.message };
    }
    throw error;
  }
}