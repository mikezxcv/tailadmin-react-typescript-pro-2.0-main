import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import appService from "../../../services/app.service";
import { ILogin, ILoginResponse } from "./interface.api";


export const useLogin = () => {

  return useMutation<ILoginResponse, Error, ILogin>({
    mutationFn: async (request: ILogin): Promise<ILoginResponse> => {
      const res = await appService.post("/authentication/login", request);
      return res.data;
    },
    onSuccess: (data: ILoginResponse) => {
      console.log("Login successful", data);
      // queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      toast.error("Error al iniciar sesión: " + error.message);
    },
  });
};