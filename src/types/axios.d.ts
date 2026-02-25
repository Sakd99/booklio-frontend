import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig<D = any> {
    _retry?: boolean;
    skipErrorToast?: boolean;
    skipAuthRefresh?: boolean;
  }

  interface InternalAxiosRequestConfig<D = any> {
    _retry?: boolean;
    skipErrorToast?: boolean;
    skipAuthRefresh?: boolean;
  }
}
