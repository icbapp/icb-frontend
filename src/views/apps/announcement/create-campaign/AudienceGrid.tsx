"use client";

import React, {
  useMemo,
  useRef,
  useState,
} from "react";
import "./styles.css";
import { AgGridReact } from "ag-grid-react";
import {
  ClientSideRowModelModule,
  QuickFilterModule,
  RowSelectionModule,
  ValidationModule,
} from "ag-grid-community";
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  RowGroupingModule,
} from "ag-grid-enterprise";

import { ModuleRegistry } from 'ag-grid-community'; 
// Register required AG Grid modules
ModuleRegistry.registerModules([
  QuickFilterModule,
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  RowGroupingModule,
  RowSelectionModule,
  ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
]);

const data = [
  {
    name: "Michael Phelps",
    age: 23,
    country: "Teachers",
    year: 2008,
    date: "24/08/2008",
    sport: "Swimming",
    gold: 8,
    silver: 0,
    bronze: 0,
    total: 8
  },
  {
    name: "Meet",
    age: 25,
    country: "Teachers",
    year: 2008,
    date: "24/08/1999",
    sport: "Learning",
    gold: 8,
    silver: 0,
    bronze: 0,
    total: 8
  },
  {
    name: "Usain Bolt",
    age: 22,
    country: "Students",
    year: 2008,
    date: "24/08/2008",
    sport: "Athletics",
    gold: 3,
    silver: 0,
    bronze: 0,
    total: 3
  },
  {
    name: "Katie Ledecky",
    age: 19,
    country: "Staff",
    year: 2016,
    date: "21/08/2016",
    sport: "Swimming",
    gold: 4,
    silver: 1,
    bronze: 0,
    total: 5
  },
  {
    name: "Simone Biles",
    age: 19,
    country: "Managers",
    year: 2016,
    date: "21/08/2016",
    sport: "Gymnastics",
    gold: 4,
    silver: 0,
    bronze: 1,
    total: 5
  },
];

const AudienceGrid = () => {
  const gridRef = useRef(null);
  const containerStyle = useMemo(() => ({ width: "100%", height: "50vh" }), []);
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

  const [columnDefs] = useState([
    { field: "country", rowGroup: true, hide: true },
    { field: "name" },
    { field: "sport" },
    { field: "year" },
    { field: "gold" },
    { field: "age" },
  ]);

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

  return (
    <div style={containerStyle}>
      <div className="example-wrapper" >
        <div style={gridStyle}>
          <AgGridReact
            groupIncludeFooter={true}
            ref={gridRef}
            rowData={data}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            autoGroupColumnDef={autoGroupColumnDef}
            rowSelection="multiple"
            groupSelectsChildren={true}
            groupSelects="descendants" //self, filteredDescendants
            animateRows={true}
            suppressAggFuncInHeader={true}
            suppressRowClickSelection={true}
          />
        </div>
      </div>
    </div>
  );
};

export default AudienceGrid;
