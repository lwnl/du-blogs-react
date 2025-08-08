import {useQuery} from "@tanstack/react-query"
import {HOST, checkLogin, LoginCheckResponse} from '../api/auth'

type UseAuthCheckReturn = {
  HOST: string,
  user?: LoginCheckResponse["user"],
  authenticated: boolean,
  message?: string,
  isLoading: boolean,
  isError: boolean,
  refetchAuth: () => void
}

export const useAuthCheck = () :UseAuthCheckReturn => { 
  const {data, isLoading, isError, refetch} = useQuery<LoginCheckResponse>({
    queryKey: ['authCheck'],
    queryFn: checkLogin,
    staleTime: 1000*60*5,
    retry: false,
  })

  return {
    HOST,
    user: data?.user,
    authenticated: data?.authenticated ?? false,
    message: data?.message,
    isLoading,
    isError,
    refetchAuth: refetch
  }
 }