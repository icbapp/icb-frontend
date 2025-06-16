'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux-store'
import {
  Typography,
  IconButton,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  Card,
  CardContent,
  Container
} from '@mui/material'
import { addRoleToDB, updateRoleToDB } from '@/redux-store/slices/role'
import type { RoleType } from '@/types/apps/roleType'
import tableStyles from '@core/styles/table.module.css'
import api from '@/utils/axiosInstance'
import { useParams, useRouter } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'
import Loader from '@/components/Loader'
import { hyphenRemove, lastWord } from '@/utils/string'
import { toast } from 'react-toastify'

type ErrorType = { message: string[] }

const RoleFormPage = () => {
  const [selectedCheckbox, setSelectedCheckbox] = useState<string[]>([])
  const [roleName, setRoleName] = useState<string>('')
  const [isIndeterminateCheckbox, setIsIndeterminateCheckbox] = useState<boolean>(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const [roleId, setRoleId] = useState(0)
  const [validationErrors, setValidationErrors] = useState<{
    roleName?: string;
    permissions?: string;
  }>({})

  const [loading, setLoading] = useState(false)
  const adminStore = useSelector((state: RootState) => state.admin)
  const [permissionsData, setPermissionsData] = useState<any>(null)

  const router = useRouter()
  const { lang: locale } = useParams()

  useEffect(() => {
    const editRoleData = localStorage.getItem('editRoleData')
    if (editRoleData) {
      const roleData = JSON.parse(editRoleData)
      setRoleName(roleData.title || '')
      setRoleId(roleData.id || 0)

      // Transform permissions data for checkboxes
      const selectedPerms = roleData.permissions?.reduce((acc: string[], permission: any) => {
        const menuId = permission.menu_id
        const subMenuIds = permission.sub_menus.map((subMenu: any) => `${menuId}-${subMenu.id}`)
        return [...acc, ...subMenuIds]
      }, []) || []

      setSelectedCheckbox(selectedPerms)
      setPermissionsData(roleData.permissions || [])
    }
  }, [])

  useEffect(() => {


    fetchPermissions()
  }, [])
  const fetchPermissions = async () => {
    try {
      setLoading(true)

      const payload = {
        tenant_id: adminStore.school_id.toString() || '',
        school_id: adminStore.tenant_id.toString() || ''
      }

      const response = await api.post('/permissions-get', payload)

      if (response.status === 200) {
        setPermissionsData(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
      // alert(error)
    }
    finally {
      setLoading(false)

    }
  }

  const togglePermission = (id: string) => {
    setSelectedCheckbox(prev =>
      prev.includes(id) ? prev.filter(perm => perm !== id) : [...prev, id]
    )
    setValidationErrors(prev => ({ ...prev, permissions: undefined }))
  }

  const validateForm = () => {
    const errors: { roleName?: string; permissions?: string } = {}

    if (!roleName.trim()) {
      errors.roleName = 'Role name is required'
    }

    if (roleId === 0 && selectedCheckbox.length === 0) {
      errors.permissions = 'At least one permission must be selected'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // Transform selected checkboxes into API format
    const permissionsMap: { [key: string]: number[] } = {}

    selectedCheckbox.forEach(perm => {
      const [menuId, subMenuId] = perm.split('-').map(Number)
      if (!permissionsMap[menuId]) {
        permissionsMap[menuId] = []
      }
      permissionsMap[menuId].push(subMenuId)
    })

    const permissions = Object.keys(permissionsMap).map(menuId => ({
      menu_id: Number(menuId),
      sub_menu_ids: permissionsMap[menuId]
    }))

    const payload = {
      id: roleId,
      name: roleName,
      tenant_id: adminStore.tenant_id.toString() || '',
      school_id: adminStore?.school_id.toString() || '',
      permissions
    }

    try {
      setLoading(true)

      const response = await api.post('/roles', payload)

      setPermissionsData(response.data.data)
      if (response.data.success) {
        toast.success(response.data.message)
        localStorage.removeItem('editRoleData')
        router.replace(getLocalizedUrl('/apps/roles', locale as Locale))
      }

    } catch (error: any) {
      toast.error(error.response.data.message)
    } finally {
      setLoading(false)
    }
  }



  const handleCancelRole = () => {

    localStorage.removeItem('editRoleData')
    router.replace(getLocalizedUrl('/apps/roles', locale as Locale))
  }

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 2000)

    // Optional: Clear timeout on unmount
    return () => clearTimeout(timeout)
  }, [])


  return (
    <div>
      {loading && <Loader />}

      <Card className='my-10'>
        <CardContent>
          <Typography variant='h4' className='text-center mb-2'>{roleId !== 0 ? "Edit Role" : "Add Role"}</Typography>
          {/* <Typography className='text-center mb-6'>Set Role Permissions</Typography> */}
          <form onSubmit={handleSubmit}>
            <TextField
              label='Role Name'
              variant='outlined'
              fullWidth
              value={roleName}
              placeholder='Enter Role Name'
              onChange={e => {
                setRoleName(e.target.value)
                setValidationErrors(prev => ({ ...prev, roleName: undefined }))
              }}
              error={!!validationErrors.roleName}
              helperText={validationErrors.roleName}
              required
            />
            <Typography variant='h5' className='my-6'>Role Permissions</Typography>

            {/* <Card className='p-5 m-10'> */}

            {validationErrors.permissions && (
              <Typography color="error" className='mb-2'>{validationErrors.permissions}</Typography>
            )}

            <hr className='border-t border-gray-300 mb-4' />  {/* Add this line */}


            <div className='flex flex-col overflow-x-auto'>
              <table className={tableStyles.table}>
                <tbody>
                  {permissionsData?.menus
                    ?.filter((menu: any) => {
                      const lowerName = menu.name.toLowerCase();
                      return !lowerName.includes('dashboard') && !lowerName.includes('profile');
                    }).map((menu: any) => (
                      <tr key={menu.menu_id}>
                        <td>
                          <Typography className='font-medium'>{hyphenRemove(menu.name)}</Typography>
                        </td>

                        <td className='text-end'>
                          <FormGroup row className='justify-end gap-6'>
                            {menu.sub_menus.length === 0 ? (
                              <Typography variant='body2' className='text-textSecondary'>No submenu</Typography>
                            ) : (
                              menu.sub_menus.map((action: any) => (
                                <FormControlLabel
                                  key={action.id}
                                  control={
                                    <Checkbox
                                      checked={selectedCheckbox.includes(`${menu.menu_id}-${action.id}`)}
                                      onChange={() => togglePermission(`${menu.menu_id}-${action.id}`)}
                                    />
                                  }
                                  label={lastWord(hyphenRemove(action.action_name))}
                                />
                              ))
                            )}
                          </FormGroup>

                        </td>

                      </tr>

                    ))}
                </tbody>
              </table>
            </div>
            {/* </Card> */}

            <div className='flex justify-center gap-4 mt-6'>
              <Button variant='contained' type='submit'>{roleId !== 0 ? "Update" : "Submit"}</Button>
              <Button
                variant='outlined'
                color='secondary'
                onClick={handleCancelRole}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default RoleFormPage
