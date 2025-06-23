// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import AccountSettingsData from '@/views/pages/account-setting-data'

const AccountTab = dynamic(() => import('@views/pages/account-setting-data/account'))
// const SecurityTab = dynamic(() => import('@views/pages/account-setting-data/security'))
// const BillingPlansTab = dynamic(() => import('@views/pages/account-setting-data/billing-plans'))
// const NotificationsTab = dynamic(() => import('@views/pages/account-setting-data/notifications'))
// const ConnectionsTab = dynamic(() => import('@views/pages/account-setting-data/connections'))

// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
    account: <AccountTab />,
    // security: <SecurityTab />,
    // 'billing-plans': <BillingPlansTab />,
    // notifications: <NotificationsTab />,
    // connections: <ConnectionsTab />
})

const AccountSettingsPage = () => {
    return <AccountSettingsData tabContentList={tabContentList()} />
}

export default AccountSettingsPage
