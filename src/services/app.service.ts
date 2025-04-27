import axios from "axios";
import { toast } from "react-toastify";

const appService = axios.create({
  baseURL: import.meta.env.VITE_API_SERVICE,
  headers: {
    "Content-Type": "application/json",
  },
});

appService.interceptors.request.use(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (config: any) => {
    const accessToken = localStorage.getItem("access_token");
    if (!config?.headers) {
      throw new Error(
        "Expected 'config' and 'config.headers' not to be undefined"
      );
    }
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

appService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      console.log("Error: Network Error");
    } else {
      console.log("Error: ", error.response);
      if (error.response.status === 403)
        toast.error("No esta autorizado para realizar esta acción");
      // 401
      else if (error.response?.status === 401) {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          try {
            const response = await appService.post("/api/auth/refresh", {
              refresh_token: refreshToken,
            });
            const { access_token, refresh_token, expires_in } = response.data;
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
            localStorage.setItem("expiresIn", expires_in.toString());
            // Reintentar la petición original
            error.config.headers.Authorization = `Bearer ${access_token}`;
            return axios(error.config);
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("expiresIn");
            window.location.href = "/signin";
          }
        } else {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("expiresIn");
          window.location.href = "/signin";
        }
      } else if (error.response.status === 404)
        toast.error("No se ha encontrado el servicio 404");
      else if (error.response.status === 400) toast.error(error.response.data);
      else if (error.response.status === 500)
        toast.error(
          "Se ha producido un error al procesar la solicitud. Intente nuevamente, si el error persiste contactar con el administrador"
        );
      else if (!error.response || !error.response.data)
        toast.error(
          "Se produjo un error inesperado. Si el error persiste actualiza la página"
        );
    }
    return Promise.reject(error);
  }
);

export default appService;
