import axios, { AxiosPromise, AxiosRequestConfig, AxiosResponse, ResponseType } from 'axios';
import { BASE_API_URL } from '../config';
import router from '../router';
import { TokenService } from './token.service';

interface Post {
  resource: string;
  data?: unknown;
  config?: any;
  host?: string;
}

interface Get {
  resource: string;
  data?: object;
  host?: string;
  confgi?: string;
}

interface Put {
  resource: string;
  data: any;
  host?: string;
}

interface Delete {
  resource: string;
  host?: string;
  data?: any;
}

export class ApiService {
  private static interceptor: number;

  /**
   * Sets the authorization header
   */
  public static setHeader(): void {
    axios.defaults.headers.common['Authorization'] = `Bearer ${TokenService.getToken()}`;
  }

  /**
   * Returns the currently used authorization header
   *
   * @returns Authorization header
   */
  public static getHeader(): string {
    return axios.defaults.headers.common['Authorization'];
  }

  /**
   * Resets the authorization header
   */
  public static removeHeader(): void {
    axios.defaults.headers.common['Authorization'] = '';
  }

  /**
   * Wrapper function for HTTP-GET method
   *
   * @param resource The rest resource to call
   * @param data The data to send with the request
   * @param host The host of the get request
   * @param responseType The type of the response
   * @returns The Promise with the return data
   */
  public static get<T>(
    { resource, data, host = BASE_API_URL }: Get,
    responseType?: ResponseType
  ): Promise<AxiosResponse<T>> {
    return axios.get(host + resource, {
      params: {
        ...(data && data)
      },
      ...(responseType && {
        responseType: responseType
      }),
      withCredentials: true
    });
  }

  /**
   * Wrapper function for HTTP-POST method
   *
   * @param resource The rest resource to call
   * @param data The data to send with the request
   * @param config Additional configuration to send with the request
   * @param host The host of the post request
   * @returns The Promise with the return data
   */
  public static post<T>({ resource, data, config, host = BASE_API_URL }: Post): Promise<AxiosResponse<T>> {
    return axios.post(host + resource, data, { ...config, withCredentials: true });
  }

  /**
   * Wrapper function for HTTP-PUT method
   *
   * @param resource The rest resource to call
   * @param data The data to send with the request
   * @param host The host of the put request
   * @returns The Promise with the return data
   */
  public static put<T>({ resource, data, host = BASE_API_URL }: Put): Promise<AxiosResponse<T>> {
    return axios.put(host + resource, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
  }

  /**
   * Wrapper function for HTTP-DELETE method
   *
   * @param resource The rest resource to call
   * @param host The host of the delete request
   * @param data The data to send with the request
   * @returns The Promise with the retur = BASE_API_URL data
   */
  public static delete<T>({ resource, host = BASE_API_URL, data }: Delete): Promise<AxiosResponse<T>> {
    return axios.delete(host + resource, {
      ...(data && { data: data }),
      withCredentials: true
    });
  }

  /**
   * Wrapper function for a custom HTTP-Request
   *
   * @param data The content of the custom request
   * @returns The Promse wth the return data
   */
  public static customRequest<T>(data: AxiosRequestConfig): AxiosPromise<T> {
    return axios(data);
  }

  /**
   * Mounts an 401 Interceptor
   */
  public static mount401Interceptor(): void {
    this.interceptor = axios.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error.config.url.includes('/refreshToken')) {
          throw error;
        }
        if (error.request.status === 502) {
          this.removeHeader();
          TokenService.removeToken();
          TokenService.removeRefreshToken();
          await router.push('/login');
          throw error;
        }
        if (error.request.status === 401) {
          this.removeHeader();
          TokenService.removeToken();
          TokenService.removeRefreshToken();
          await router.push('/logout');
        }
        if (error.request.status === 403) {
          this.removeHeader();
          TokenService.removeToken();
          TokenService.removeRefreshToken();
          await router.push('/logout');
        }
        throw error;
      }
    );
  }

  /**
   * Unmounts the 401 Interceptor
   */
  public static unmount401Interceptor(): void {
    axios.interceptors.response.eject(this.interceptor);
  }
}
