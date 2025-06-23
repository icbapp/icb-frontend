// MUI Imports
import Grid from '@mui/material/Grid2'

import AccountDetailsData from './AccountDetailsData'

const Account = () => {
    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <AccountDetailsData />
            </Grid>
            {/* <Grid size={{ xs: 12 }}>
        <AccountDelete />
      </Grid> */}
        </Grid>
    )
}

export default Account
