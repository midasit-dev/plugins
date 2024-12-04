import { GuideBox, DataGrid, DataGridProps } from "@midasit-dev/moaui";
import { useState } from "react";

const DefalutDataGrid = () => {
  /**
   * Posible interaction
   * but Don't insert component
   */
  const [value, setValue] = useState(1);

  const coloums = [
    {
      editable: true, // 수정 여부
      field: "id",
      headerName: "ID",
      width: 70,
    },
    {
      editable: false, // 수정 여부
      field: "firstName",
      headerName: "First name",
      width: 130,
    },
    {
      field: "lastName",
      headerName: "Last name",
      width: 130,
    },
    {
      field: "age",
      headerName: "age",
      width: 130,
    },
  ];
  const rows = [
    {
      age: 35,
      firstName: "lee",
      id: 1,
      lastName: "Snow",
    },
    {
      age: 42,
      firstName: "Cersei",
      id: 2,
      lastName: "Lannister",
    },
    {
      age: 45,
      firstName: "Jaime",
      id: 3,
      lastName: "Lannister",
    },
  ];
  function onChangeHandler(event: any) {
    // setValue(event.id);
  }
  return (
    <div>
      {/* {Radio Components} */}
      DataGrid
      <GuideBox>
        <DataGrid
          //onCellKeyDown={onChangeHandler} // key down
          // onCellClick={onChangeHandler} // cell click
          checkboxSelection
          columns={coloums}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          rows={rows}
        />
      </GuideBox>
    </div>
  );
};

export default DefalutDataGrid;
