export interface EndPointApi {
    login: string;
    register: string;
    logout: string;
    forgotPassword: string;
    resetPassword: string;
    changePassword: string;
    verifyEmail: string;
    getRole: string;
}

// Define and export the API endpoint object
const endPointApi: EndPointApi = {
    login: 'auth/login',
    register: 'auth/register',
    logout: 'auth/logout',
    forgotPassword: 'auth/forgot-password-check',
    resetPassword: 'auth/reset-password',
    changePassword: 'auth/change-password',
    verifyEmail: 'auth/verify-email',
    getRole: 'role-get',
};

export default endPointApi;
