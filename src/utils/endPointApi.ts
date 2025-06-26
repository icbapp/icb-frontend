export interface EndPointApi {
    login: string;
    register: string;
    logout: string;
    forgotPassword: string;
    resetPassword: string;
    changePassword: string;
    verifyEmail: string;
    getRole: string;

    //Theme save
    themeSettingSave: string;
    getTheme: string;
       
    //School-settings
    //Email
    postEmailSetting: string
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

    //Theme save
    themeSettingSave: 'theme-colors-fonted-add',
    getTheme: 'theme-colors-fonted-get',
    //School-settings
    //Email
    postEmailSetting: 'email-setting',
};

export default endPointApi;
