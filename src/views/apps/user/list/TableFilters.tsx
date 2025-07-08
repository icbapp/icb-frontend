'use client'

import { useState, useEffect } from 'react'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid2'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { UsersType } from '@/types/apps/userTypes'
import { api } from '@/utils/axiosInstance'
import Loader from '@/components/Loader'
import { optionCommon } from '@/utils/optionComman'
import { Autocomplete, Box, Button, Checkbox, ListItemText, OutlinedInput, Skeleton, TextField } from '@mui/material'
import endPointApi from '@/utils/endPointApi'

const MenuProps = {
  PaperProps: {
    sx: {
      maxHeight: 320, // ≈ 2 items * row height (adjust if needed)
      overflowY: 'auto',
      '& .MuiMenuItem-root': {
        py: 1
      },
      '& .dropdown-footer': {
        position: 'sticky',
        bottom: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #e0e0e0',
        padding: '8px 16px',
        zIndex: 1
      }
    }
  }
}
export interface TableFiltersProps {
  role: string
  setRole: (role: string) => void
  status: string
  setStatus: (status: string) => void
  handleOpenMultipleRoleDialog: () => void
  selectedUserIds: (string | number)[]
  roleName: { id: string | number; name: string }[]
  setRoleName: React.Dispatch<React.SetStateAction<{ id: string | number; name: string }[]>>
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
// const MenuProps = {
//   PaperProps: {
//     style: {
//       maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//       width: 250,
//     },
//   },
// };

const TableFilters = ({ role, setRole, status, setStatus,roleName, setRoleName, handleOpenMultipleRoleDialog }: TableFiltersProps) => {
  const [rolesList, setRolesList] = useState<{ id: string | number; name: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true)
        const response = await api.get(`${endPointApi.getRolesDropdown}`)
        const roles = response.data.data.filter((item: any) => item.name !== 'Super Admin')
        setRolesList(roles)
      } catch (err) {
        return null
      }
      finally {
        setLoading(false)
      }
    }
    fetchRoles()
  }, [])

  const handleChange = (event: any) => {
    const selectedNames = typeof event.target.value === 'string'
      ? event.target.value.split(',')
      : event.target.value

    const selectedObjects = rolesList.filter(role =>
      selectedNames.includes(role.name)
    )
    setRoleName(selectedObjects)
  }

  return (
    <CardContent>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 5 }}>
          {loading ? (
            <Skeleton variant="rounded" height={55} />
          ) : (
            <FormControl fullWidth>
              <Autocomplete
                fullWidth
                options={rolesList}
                getOptionLabel={(option: any) => option.name}
                value={rolesList.find((item: any) => item.id === role) || null}
                onChange={(event, newValue: any) => {
                  setRole(newValue ? newValue.id : '')
                }}
                isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} label="Select Role" />
                )}
                clearOnEscape
              />
            </FormControl>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 5 }}>
          {loading ? (
            <Skeleton variant="rounded" height={55} />
          ) : (
            <FormControl fullWidth>
              <Autocomplete
                fullWidth
                options={optionCommon}
                getOptionLabel={(option) => option.name}
                value={optionCommon.find((item) => item.value === status) || null}
                onChange={(event, newValue) => {
                  setStatus(newValue ? newValue.value : '')
                }}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                renderInput={(params) => (
                  <TextField {...params} label="Select Status" />
                )}
                clearOnEscape
              />
            </FormControl>
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          {loading ? (
            <Skeleton variant="rounded" height={55} />
          ) : (
            <FormControl fullWidth>
              {/* <Autocomplete
                fullWidth
                options={rolesList}
                getOptionLabel={(option: any) => option.name}
                value={rolesList.find((item: any) => item.id === role) || null}
                onChange={(event, newValue: any) => {
                  setRole(newValue ? newValue.id : '')
                }}
                isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} label="Bulk Role Change" />
                )}
                clearOnEscape
              /> */}
              <InputLabel id="demo-multiple-checkbox-label">Bulk Role Change</InputLabel>
                <Select
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  multiple
                  value={roleName.map(r => r.name)} // must be strings for MUI
                  onChange={handleChange}
                  input={<OutlinedInput label="Bulk Role Change" />}
                  renderValue={(selected) => selected.join(', ')}
                  MenuProps={MenuProps}
                >
                  {rolesList.filter(role => role.name !== 'Default').map((item) => (
                    <MenuItem key={item.id} value={item.name}>
                      <Checkbox checked={roleName.some(role => role.id === item.id)} />
                      <ListItemText primary={item.name} />
                    </MenuItem>
                  ))}

                  {/* Save Button inside dropdown */}
                   <Box className="dropdown-footer">
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="small"
                      onClick={() => {
                        handleOpenMultipleRoleDialog()
                        document.activeElement instanceof HTMLElement && document.activeElement.blur()
                      }}
                    >
                      Save
                    </Button>
                  </Box>
                </Select>
            </FormControl>
          )}
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
