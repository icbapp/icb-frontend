'use client'
import React, { useMemo, useRef, useState } from "react";
import "./styles.css";
import { AgGridReact } from "ag-grid-react";
import {
  ClientSideRowModelModule,
  QuickFilterModule,
  RowSelectionModule,
  ValidationModule,
  PaginationModule,
} from "ag-grid-community";
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  RowGroupingModule,
} from "ag-grid-enterprise";
import { ModuleRegistry } from "ag-grid-community";
import { Autocomplete, TextField } from "@mui/material";
// Register required AG Grid modules
ModuleRegistry.registerModules([
  QuickFilterModule,
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  RowGroupingModule,
  RowSelectionModule,
  PaginationModule,
  ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
]);
const data = [
  {name: "Michael Phelps", age: 23, roll: "Teacher", year: 2008, date: "24/08/2008", sport: "Swimming", gold: 8, silver: 0, bronze: 0, total: 8 },
  {name: "Michael Phelps", age: 23, roll: "Teacher", year: 2008, date: "24/08/2008", sport: "Swimming", gold: 8, silver: 0, bronze: 0, total: 8 },
  {name: "Michael Phelps", age: 23, roll: "Teacher", year: 2008, date: "24/08/2008", sport: "Swimming", gold: 8, silver: 0, bronze: 0, total: 8 },
  {name: "Michael Phelps", age: 23, roll: "Teacher", year: 2008, date: "24/08/2008", sport: "Swimming", gold: 8, silver: 0, bronze: 0, total: 8 },
  {name: "Meet", age: 25, roll: "Teacher", year: 2008, date: "24/08/1999", sport: "Learning", gold: 8, silver: 0, bronze: 0, total: 8 },
  {name: "Usain Bolt", age: 22, roll: "Student", year: 2008, date: "24/08/2008", sport: "Athletics", gold: 3, silver: 0, bronze: 0, total: 3 },
  {name: "Katie Ledecky", age: 19, roll: "Staff", year: 2016, date: "21/08/2016", sport: "Swimming", gold: 4, silver: 1, bronze: 0, total: 5 },
  {name: "Simone Biles", age: 19, roll: "Managers", year: 2016, date: "21/08/2016", sport: "Gymnastics", gold: 4, silver: 0, bronze: 1, total: 5 },
  {name: "Simone Biles", age: 19, roll: "demo", year: 2016, date: "21/08/2016", sport: "Gymnastics", gold: 4, silver: 0, bronze: 1, total: 5 },
  {name: "Simone Biles", age: 19, roll: "test", year: 2016, date: "21/08/2016", sport: "Gymnastics", gold: 4, silver: 0, bronze: 1, total: 5 },
  {name: "Simone Biles", age: 19, roll: "hello", year: 2016, date: "21/08/2016", sport: "Gymnastics", gold: 4, silver: 0, bronze: 1, total: 5 },
  {name: "Simone Biles", age: 19, roll: "meet", year: 2016, date: "21/08/2016", sport: "Gymnastics", gold: 4, silver: 0, bronze: 1, total: 5 },
  {name: "Simone Biles", age: 19, roll: "demo1", year: 2016, date: "21/08/2016", sport: "Gymnastics", gold: 4, silver: 0, bronze: 1, total: 5 },
  {name: "Simone Biles", age: 19, roll: "demo2", year: 2016, date: "21/08/2016", sport: "Gymnastics", gold: 4, silver: 0, bronze: 1, total: 5 },
  {name: "Simone Biles", age: 19, roll: "demo3", year: 2016, date: "21/08/2016", sport: "Gymnastics", gold: 4, silver: 0, bronze: 1, total: 5 },
  {name: "Simone Biles", age: 19, roll: "demo4", year: 2016, date: "21/08/2016", sport: "Gymnastics", gold: 4, silver: 0, bronze: 1, total: 5 },
].map((item, index) => ({
  id: index + 1,
  ...item,
}));
const top100Films = [
  { label: "teacher", year: 1994 },
  { label: "student", year: 1972 },
  { label: "staff", year: 1974 },
  { label: "Managers", year: 1974 },
  { label: "demo", year: 1974 },
  { label: "test", year: 1974 },
  { label: "hello", year: 1974 },
  { label: "meet", year: 1974 },
  { label: "demo1", year: 1974 },
  { label: "demo2", year: 1974 },
  { label: "demo3", year: 1974 },
  { label: "demo4", year: 1974 },
];

export interface Props {
 setSelectedIds: any,
 rolesList: any
}

const AudienceGrid = ({setSelectedIds,rolesList}: Props) => {
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [filteredData, setFilteredData] = useState(data);
  const gridRef = useRef(null);
  const containerStyle = useMemo(() => ({ width: "100%", height: "50vh" }), []);
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  const [columnDefs] = useState([
    { field: "roll", rowGroup: true, hide: true },
    { field: "name" },
    { field: "sport" },
    { field: "year" },
    { field: "gold" },
    { field: "age" },
  ]);
// console.log("data",data);
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 120,
    resizable: true,
    sortable: true,
    filter: true,
  }), []);
  const autoGroupColumnDef = useMemo(() => ({
    headerName: "Role",
    field: "name",
    minWidth: 250,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    cellRendererParams: {
      suppressCount: true,
    },
  }), []);
  const handleFilterChange = (event, newValues) => {
    setSelectedLabels(newValues);
    if (newValues && newValues.length > 0) {
      const selectedRoles = newValues.map((val:any) => val.label.toLowerCase());
      const filtered = data.filter(item =>
        selectedRoles.includes(item.roll.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData([]); // Show all if nothing selected
    }
  };
  
const pagination = true;
// sets 10 rows per page (default is 100)
const paginationPageSize = 2;
// allows the user to select the page size from a predefined list of page sizes
const paginationPageSizeSelector = [2, 20, 50, 100];
const handleSelectionChanged = () => {
  const selectedNodes = gridRef.current.api.getSelectedNodes();
  setSelectedIds(selectedNodes.map((node:any) => node.data.id))
};
  return (
    <>
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={rolesList}
        getOptionLabel={(option) => option.name}
        value={selectedLabels}
        onChange={handleFilterChange}
        sx={{ width: 400, marginBottom: 2 }}
        renderInput={(params) => <TextField {...params} label="Select Roles" />}
      />
      <div style={containerStyle}>
        <div className="example-wrapper">
          <div style={gridStyle}>
           <AgGridReact
              groupIncludeFooter={true}
              ref={gridRef}
              rowData={filteredData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              autoGroupColumnDef={autoGroupColumnDef}
              rowSelection="multiple"
              groupSelectsChildren={true}
              groupSelects="descendants"
              animateRows={true}
              suppressAggFuncInHeader={true}
              suppressRowClickSelection={true}
              pagination={pagination}
              paginationPageSize={paginationPageSize}
              paginationPageSizeSelector={paginationPageSizeSelector}
              onSelectionChanged={handleSelectionChanged}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default AudienceGrid;