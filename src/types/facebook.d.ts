// Facebook JS SDK type declarations
interface FBLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse: {
    accessToken: string;
    code?: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
  } | null;
}

interface FBLoginOptions {
  scope?: string;
  config_id?: string;
  response_type?: string;
  override_default_response_type?: boolean;
}

interface FB {
  init(params: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
  }): void;
  login(callback: (response: FBLoginResponse) => void, options?: FBLoginOptions): void;
  getLoginStatus(callback: (response: FBLoginResponse) => void): void;
}

interface Window {
  FB?: FB;
  fbAsyncInit?: () => void;
}
