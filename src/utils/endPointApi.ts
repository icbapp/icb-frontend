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
       
    //User Management
    getUser: string
    postMultipleStatusChange: string
    postMultipleRoleChange: string
    
    //Role & Permission
    getAllRoles: string
    getRolesDropdown: string
    postRolesAddUpdate: string

    //School-settings
    //Email
    postEmailSetting: string
    //Microsoft
    microsoftAuthTokenValide: string
    microsoftFetchUsers: string

    // Announcements
    getAnnouncements: string
    addAnnouncements: string
    deleteAnnouncements: string,
    deleteImageAnnouncements: string
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

    //User Management
    getUser: 'user-get',
    postMultipleStatusChange: 'users/status-toggle-multiple',
    postMultipleRoleChange: 'users/roles-toggle-multiple',

    //Role & Permission
    getAllRoles:'roles-all-get',
    getRolesDropdown: 'roles-show',
    postRolesAddUpdate: 'roles-add-update',

    //School-settings
    //Email
    postEmailSetting: 'email-setting',
    //Microsoft
    microsoftAuthTokenValide: '/ms-auth-token/school-token-valide',
    microsoftFetchUsers: 'auth/microsoft/fetch-users',

    // Announcements
    getAnnouncements: 'announcements-get',
    addAnnouncements: 'announcements-add',
    deleteAnnouncements: 'announcements-delete',
    deleteImageAnnouncements: 'announcements-delete-image',
};

export default endPointApi;