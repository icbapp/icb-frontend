// src/views/announcements/CampaignDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Grid
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

const CampaignDialog = ({ open, onClose, announcement }: any) => {
  const { control, handleSubmit } = useForm()

  const onSubmit = (data:any) => {
    console.log('Campaign Data:', data)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Campaign Management - {announcement.title}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField fullWidth label="Filter by Name" {...field} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField fullWidth label="Filter by Email" {...field} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="mobile"
                control={control}
                render={({ field }) => (
                  <TextField fullWidth label="Filter by Mobile" {...field} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <TextField fullWidth label="Filter by Role" {...field} />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox />}
                  label="Email"
                />
                <FormControlLabel
                  control={<Checkbox />}
                  label="SMS"
                />
                <FormControlLabel
                  control={<Checkbox />}
                  label="WhatsApp"
                />
                <FormControlLabel
                  control={<Checkbox />}
                  label="Push Notification"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Send Campaign
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CampaignDialog
