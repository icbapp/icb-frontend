import React, { useEffect, useRef } from 'react'
import {
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Autocomplete,
  Card,
  MenuItem,
  InputAdornment,
  Tooltip,
  Stack,
  Skeleton,
  Chip,
  Paper
} from '@mui/material'
import {
  awardCodeDropDown,
  awardDescriptionDropDown,
  classCodeDropDown,
  contactTypeDropDown,
  employeeStatusDropDown,
  genderDropDown,
  houseDropDown,
  positionTitleDropDown,
  roleCodeDropDown,
  salutationtitleDropDown,
  staffPositionDropDown,
  studentStatusDropDown,
  yearGroupDropDown
} from '@/comman/dropdownOptions/DropdownOptions'

export interface Props {
  roleLoading: boolean
  connectDataLack: string | null
  rolesListDataLack: any
  selectedLabelsDataLack: any
  commanColumnFilter: any
  rolesList: any
  selectedLabels: any
  setCommanColumnFilter: any
  studentForm?: any
  teacherForm?: any
  parentForm?: any
  setStudentForm?: any
  setTeacherForm?: any
  setParentForm?: any
  filterWishDataLack?: any
  filterWishSelectedLabelsDataLack?: any
  setFilterWishSelectedLabelsDataLack?: any
  setSelectedLabelsDataLack?: any
  selectedData?: any
  goFilterData?: any
  setSelectedData?: any
  setSelectedLabels?: any
  setFilterWishCommonColumn?: any
  filterWishCommonColumn?: any
  columnSelectedEdit?: any 
}
const FilterCampaign = ({
  roleLoading,
  connectDataLack,
  rolesListDataLack,
  selectedLabelsDataLack,
  commanColumnFilter,
  rolesList,
  selectedLabels,
  setCommanColumnFilter,
  studentForm,
  teacherForm,
  parentForm,
  setStudentForm,
  setTeacherForm,
  setParentForm,
  filterWishDataLack,
  filterWishSelectedLabelsDataLack,
  setFilterWishSelectedLabelsDataLack,
  setSelectedLabelsDataLack,
  selectedData,
  goFilterData,
  setSelectedData,
  setSelectedLabels,
  filterWishCommonColumn,
  setFilterWishCommonColumn,
  columnSelectedEdit
}: Props) => {
  //Comman Column Filter
  // const handleSelectCommonColumn = (id: number) => {
  //   setFilterWishCommonColumn((prev: any) =>
  //     prev.includes(id) ? prev.filter((item: any) => item !== id) : [...prev, id]
  //   )
  // }
  console.log("columnSelectedEdit",columnSelectedEdit);

  const handleSelectCommonColumn = (id: string) => {
    setFilterWishCommonColumn((prev: any) =>
      prev.includes(id) ? prev.filter((item: any) => item !== id) : [...prev, id]
    )
  }

  // type of selection state
  type SelectedItem = { id: number; role: string }

  // toggle selection scoped by BOTH id and role
  const handleSelect = (id: number, roleName: string) => {
    setFilterWishSelectedLabelsDataLack(prev => {
      const idx = prev.findIndex(x => x.id === id && x.role === roleName)
      if (idx !== -1) {
        return prev.filter((_, i) => i !== idx)
      }
      return [...prev, { id, role: roleName }]
    })
  }

  const handleChangeColumnFilter = (field: string, value: string) => {
    setCommanColumnFilter((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFilterChange = (newValues: any) => {
    setSelectedLabels(newValues)
  }

  const handleChangeParentColumnFilter = (field: string, value: string) => {
    setParentForm((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleChangeTeacherForm = (field: string, value: any) => {
    setTeacherForm((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleChangeStudentForm = (field: string, value: any) => {
    setStudentForm((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFilterChangeDataLack = (newValues: any) => {
    setSelectedLabelsDataLack(newValues)

    // optional: if nothing is selected → reset all
    if (!newValues || newValues.length === 0) {
      setSelectedData([]) // or reset all forms
    }
  }

  const array = [
    { id: 'f_name', name: 'First Name' },
    { id: 'l_name', name: 'Last Name' },
    // { id: 'email', name: 'Email' },
    // { id: 'phone', name: 'Phone' },
    { id: 'gender', name: 'Gender' }
  ]

  const commonColumnData = array.reduce((acc: any, item: any) => {
    if (!acc[item.rol_name]) acc[item.rol_name] = []
    acc[item.rol_name].push(item)
    return acc
  }, {})
  
  //Default Parent, student, teacher selected
  const groupedDataRoleWise = filterWishDataLack?.reduce((acc: any, item: any) => {
    if (!acc[item.rol_name]) acc[item.rol_name] = []
    acc[item.rol_name].push(item)
    return acc
  }, {})

  /** Normalize helpers */
  const toKey = (s: any) =>
    String(s ?? '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')

  const sameKey = (a: any, b: any) => toKey(a) === toKey(b)

  /** Role-wise default field keys (add synonyms you use) */
  const defaultRoleSelections: Record<string, string[]> = {
    parent: ['email', 'm_phone1', 'mobile_1', 'm_phone2', 'mobile_2', 'phone_2', 'par_name'],
    student: ['first_name', 'last_name', 'email', 'gender', 'mobile_phone'],
    teacher: ['first_name', 'gender','p_mobile', 'other_name', 'p_email']
  }

  /** Track which roles have already been seeded (so each role seeds once) */
  const seededRolesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!groupedDataRoleWise || Object.keys(groupedDataRoleWise).length === 0) return

    Object.entries(groupedDataRoleWise).forEach(([roleKey, items]: [string, any[]]) => {
      if (!items || items.length === 0) return

      const roleNorm = toKey(roleKey)
      if (seededRolesRef.current.has(roleNorm)) return // already seeded this role

      const wanted =  defaultRoleSelections[roleNorm]
      if (!wanted || wanted.length === 0) {
        // No defaults defined for this role: mark as seeded to avoid rechecking forever
        seededRolesRef.current.add(roleNorm)
        return
      }

      let didSeedForThisRole = false

      items.forEach(item => {
        const itemFieldKey = toKey(item?.name ?? item?.label ?? item?.key)
        if (!wanted.includes(itemFieldKey)) return

        const itemRole = item?.rol_name ?? roleKey // ensure same value you store in state
        const alreadySelected = filterWishSelectedLabelsDataLack?.some(
          (x: any) => x.id === item.id && sameKey(x.role, itemRole)
        )

        if (!alreadySelected) {
          handleSelect(item.id, itemRole) // your toggler should add when not selected
          didSeedForThisRole = true
        }
      })

      // Mark this role as seeded regardless (prevents repeated seeding loops)
      seededRolesRef.current.add(roleNorm)
    })
  }, [groupedDataRoleWise, filterWishSelectedLabelsDataLack]) // runs when roles/items/state change

  console.log("filterWishDataLack",filterWishDataLack);
  
  const groupedData = filterWishDataLack?.reduce((acc: any, item: any) => {
    if (!acc[item.rol_name]) acc[item.rol_name] = []
    acc[item.rol_name].push(item)
    return acc
  }, {})

  const roleChipColors: Record<string, string> = {
    parent: 'rgb(102 108 255 / 0.32)', // green
    teacher: 'rgb(109 120 141 / 0.32)', // red
    student: 'rgb(255 77 73 / 0.32)' // blue
  }
  return (
    <>
      <Card sx={{ mt: 4 }}>
        <Box p={6}>
          {/* Audience Selection */}
          <Typography variant='h6' fontWeight={600} mb={3}>
            Select Roles
          </Typography>
          {roleLoading ? (
            <Grid container spacing={2}>
              <Grid item>
                <Skeleton variant='rectangular' width={600} height={56} className='rounded-md' />
              </Grid>
            </Grid>
          ) : connectDataLack ? (
            <>
              <Grid item xs={12} md={12}>
                <Stack spacing={3}>
                  {/* Top Row: Role Select + Go Button */}
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Autocomplete
                      multiple
                      disableCloseOnSelect
                      options={rolesListDataLack}
                      getOptionLabel={option => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={selectedLabelsDataLack}
                      onChange={(event, newValue) => handleFilterChangeDataLack(newValue)}
                      sx={{ width: 600 }}
                      renderInput={params => <TextField {...params} />}
                    />
                  </Stack>

                  {/* Role-wise Filters */}
                </Stack>
              </Grid>
            </>
          ) : (
            <Grid container spacing={2} mb={4}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={rolesList}
                getOptionLabel={option => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedLabels}
                onChange={(event, newValue) => handleFilterChange(newValue)}
                sx={{ width: 400, marginBottom: 2 }}
                renderInput={params => <TextField {...params} />}
              />
            </Grid>
          )}
        </Box>
      </Card>

      {selectedLabelsDataLack && selectedLabelsDataLack.length > 0 && (
        <>
          <Card sx={{ mt: 4 }}>
            <Box p={6}>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                Role-wise Filters
              </Typography>
              {selectedLabelsDataLack.some((val: any) => val.id === 'student') && (
                <>
                  <Typography variant='h6' fontWeight={600} sx={{ mt: 2 }}>
                    Students
                  </Typography>
                  <Grid container spacing={1}>
                    {(groupedData?.student || []).map((field: any, index: number) => (
                      <Grid item xs={12} md={2} key={index}>
                        {field.filter_values !== null ? (
                          <TextField
                            label={field.name}
                            select
                            fullWidth
                            value={studentForm?.[field.id] || []}
                            onChange={e => handleChangeStudentForm(field.id, e.target.value)}
                            SelectProps={{
                              multiple: true,
                              renderValue: (selected: any) => selected.join(', ')
                            }}
                          >
                            {field.filter_values.split(',').map((option: string, i: number) => (
                              <MenuItem key={i} value={option.trim()}>
                                {option.trim()}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <TextField
                            label={field.name}
                            fullWidth
                            type={
                              field.id === 'dob' || field.id === 'entry_date' || field.id === 'exit_date'
                                ? 'date'
                                : 'text'
                            }
                            value={studentForm?.[field.id] || ''}
                            onChange={e => handleChangeStudentForm(field.id, e.target.value)}
                            InputLabelProps={
                              field.id === 'dob' || field.id === 'entry_date' || field.id === 'exit_date'
                                ? { shrink: true }
                                : {}
                            }
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
              {selectedLabelsDataLack.some((val: any) => val.id === 'parent') && (
                <>
                  <Typography variant='h6' fontWeight={600} sx={{ mt: 2 }}>
                    Parents
                  </Typography>
                  <Grid container spacing={1}>
                    {(groupedData?.parent ?? []).map((field: any) => {
                      // Normalize options (stringified JSON or array)
                      const contactOptions: { contact_type: string; contact_desc: string }[] = Array.isArray(
                        field?.filter_values
                      )
                        ? field.filter_values
                        : (() => {
                            try {
                              return JSON.parse(field?.filter_values || '[]')
                            } catch {
                              return []
                            }
                          })()

                      // Is this a contact-type multi-select?
                      const isContactSelect =
                        Array.isArray(contactOptions) &&
                        contactOptions.length > 0 &&
                        contactOptions[0]?.contact_type !== undefined

                      // Value: array for multi-select, string otherwise
                      const value = parentForm?.[field.id] ?? (isContactSelect ? [] : '')

                      // Build a quick lookup map (no hooks)
                      const byType = new Map(contactOptions.map(o => [String(o.contact_type), o.contact_desc]))

                      return (
                        <Grid item xs={12} md={2} key={field.id ?? field.name}>
                          {isContactSelect ? (
                            <TextField
                              label={field.name}
                              select
                              fullWidth
                              value={value} // array of contact_type strings
                              onChange={e => handleChangeParentColumnFilter(field.id, e.target.value)}
                              SelectProps={{
                                multiple: true,
                                renderValue: (selected: string[]) =>
                                  (selected ?? []).map(v => byType.get(String(v)) ?? v).join(', ')
                              }}
                            >
                              {contactOptions.map(opt => (
                                <MenuItem key={opt.contact_type} value={String(opt.contact_type)}>
                                  {opt.contact_desc}
                                </MenuItem>
                              ))}
                            </TextField>
                          ) : (
                            <TextField
                              label={field.name}
                              fullWidth
                              value={value}
                              onChange={e => handleChangeParentColumnFilter(field.id, e.target.value)}
                            />
                          )}
                        </Grid>
                      )
                    })}
                  </Grid>
                </>
              )}
              {selectedLabelsDataLack.some((val: any) => val.id === 'teacher') && (
                <>
                  <Typography variant='h6' fontWeight={600} sx={{ mt: 2 }}>
                    Teachers
                  </Typography>
                  <Grid container spacing={1}>
                    {(groupedData?.teacher || []).map((field: any, index: number) => (
                      <Grid item xs={12} md={2} key={index}>
                        {field.filter_values !== null ? (
                          <TextField
                            label={field.name}
                            select
                            fullWidth
                            value={teacherForm?.[field.id] || []}
                            onChange={e => handleChangeTeacherForm(field.id, e.target.value)}
                            SelectProps={{
                              multiple: true,
                              renderValue: (selected: any) => selected.join(', ')
                            }}
                          >
                            {field.filter_values.split(',').map((option: string, i: number) => (
                              <MenuItem key={i} value={option.trim()}>
                                {option.trim()}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <TextField
                            label={field.name}
                            fullWidth
                            type={
                              field.id === 'dob' || field.id === 'start_date' || field.id === 'end_date'
                                ? 'date'
                                : 'text'
                            }
                            value={teacherForm?.[field.id] || ''}
                            onChange={e => handleChangeTeacherForm(field.id, e.target.value)}
                            InputLabelProps={
                              field.id === 'dob' || field.id === 'start_date' || field.id === 'end_date'
                                ? { shrink: true }
                                : {}
                            }
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </Box>
          </Card>

          <Card sx={{ mt: 4 }}>
            <Box p={6}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3
                }}
              >
                {/* Common Column Start */}
                {/* {Object.keys(commonColumnData).map(role => {
                  if (!commonColumnData[role] || commonColumnData[role].length === 0) {
                    return null
                  }

                  return (
                    <Paper
                      key={role}
                      elevation={2}
                      sx={{
                        p: 3
                        // borderRadius: 1,
                        // border: '1px solid',
                        // borderColor: 'divider',
                        // backgroundColor: 'background.paper'
                      }}
                    >
                      <Typography
                        variant='subtitle1'
                        sx={{
                          mb: 2,
                          fontWeight: 700,
                          color: 'text.primary',
                          borderBottom: '2px solid #1f5634',
                          display: 'inline-block',
                          pb: 0.5,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}
                      >
                        Common Column
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1.5
                        }}
                      >
                        {commonColumnData[role]?.map((item: any) => (
                          <Chip
                            key={item.id}
                            label={item.name}
                            onClick={() => handleSelectCommonColumn(item.id)}
                            clickable
                            variant={filterWishCommonColumn.includes(item.id) ? 'filled' : 'outlined'}
                            sx={{
                              borderRadius: '20px',
                              px: 1.5,
                              py: 0.5,
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              borderColor: filterWishCommonColumn.includes(item.id) ? '#1f5634' : 'grey.400',
                              backgroundColor: filterWishCommonColumn.includes(item.id) ? '#1f5634' : 'transparent',
                              color: filterWishCommonColumn.includes(item.id) ? 'white' : 'text.primary',
                              '&:hover': {
                                backgroundColor: filterWishCommonColumn.includes(item.id)
                                  ? '#144327'
                                  : 'rgba(31, 86, 52, 0.08)'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Paper>
                  )
                })} */}
                {/* Common Column End  */}
                {/* {Object.keys(groupedDataRoleWise).map(role => {
                  if (!groupedDataRoleWise[role] || groupedDataRoleWise[role].length === 0) {
                    return null
                  }

                  return (
                    <Paper key={role} elevation={2} sx={{ p: 3 }}>
                      <Typography
                        variant='subtitle1'
                        sx={{
                          mb: 2,
                          fontWeight: 700,
                          color: 'text.primary',
                          borderBottom: '2px solid #bfc4c1ff',
                          display: 'inline-block',
                          pb: 0.5,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}
                      >
                        {role}
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {groupedDataRoleWise[role].map((item: any) => {
                          const roleColor = roleChipColors[role.toLowerCase()] || '#1f5634'
                          // role-aware selection check
                          const isSelected = filterWishSelectedLabelsDataLack.some(
                            x => x.id === item.id && x.role === item.rol_name
                          )

                          return (
                            <Chip
                              key={`${item.rol_name}-${item.id}`} // unique per role + id
                              label={item.name}
                              onClick={() => handleSelect(item.id, item.rol_name)}
                              clickable
                              variant={isSelected ? 'filled' : 'outlined'}
                              sx={{
                                borderRadius: '20px',
                                px: 1.5,
                                py: 0.5,
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                borderColor: roleColor,
                                backgroundColor: isSelected ? roleColor : 'transparent',
                                color: isSelected ? '#5c5a5aff' : '#696767ff',
                                '&:hover': {
                                  backgroundColor: isSelected ? roleColor : `${roleColor}20`
                                }
                              }}
                            />
                          )
                        })}
                      </Box>
                    </Paper>
                  )
                })} */}

                {Object.keys(groupedDataRoleWise).map(roleKey => {
                  const items = groupedDataRoleWise[roleKey]
                  if (!items || items.length === 0) return null

                  const roleLower = toKey(roleKey)
                  const roleColor = roleChipColors[roleLower] || '#1f5634'

                  return (
                    <Paper key={roleKey} elevation={2} sx={{ p: 3 }}>
                      <Typography
                        variant='subtitle1'
                        sx={{
                          mb: 2,
                          fontWeight: 700,
                          color: 'text.primary',
                          borderBottom: '2px solid #bfc4c1ff',
                          display: 'inline-block',
                          pb: 0.5,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}
                      >
                        {roleKey}
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {items.map((item: any) => {
                          const chipRole = item?.rol_name ?? roleKey

                          // ✅ selected purely from current state -> click toggles off too
                          const isSelected = filterWishSelectedLabelsDataLack?.some(
                            (x: any) => x.id === item.id && sameKey(x.role, chipRole)
                          )

                          return (
                            <Chip
                              key={`${chipRole}-${item.id}`}
                              label={item.name}
                              onClick={() => handleSelect(item.id, chipRole)}
                              clickable
                              variant={isSelected ? 'filled' : 'outlined'}
                              sx={{
                                borderRadius: '20px',
                                px: 1.5,
                                py: 0.5,
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                borderColor: roleColor,
                                backgroundColor: isSelected ? roleColor : 'transparent',
                                color: isSelected ? '#5c5a5aff' : '#696767ff',
                                '&:hover': {
                                  backgroundColor: isSelected ? roleColor : `${roleColor}20`
                                }
                              }}
                            />
                          )
                        })}
                      </Box>
                    </Paper>
                  )
                })}
              </Box>
              <Button variant='contained' onClick={goFilterData} sx={{ height: 40, mt: 3 }}>
                Submit
              </Button>
            </Box>
          </Card>
        </>
      )}
    </>
  )
}

export default FilterCampaign
