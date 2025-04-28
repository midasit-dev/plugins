import { Table, TableHead, TableRow, TableCell, TableBody, Typography, Scrollbars } from "@midasit-dev/moaui"; 

const ComponentsTableBundle = ({ tableData }) => {
  return (
   
    <Table padding='normal'>
       
      <TableHead style={{ position: 'sticky', top: 0,zIndex: 1 }}>
        <TableRow>
          <TableCell>
            <Typography>Node</Typography>
          </TableCell>
          <TableCell>
            <Typography>Dx Stiffness</Typography>
          </TableCell>
          <TableCell>
            <Typography>Dy Stiffness</Typography>
          </TableCell>
          <TableCell>
            <Typography>Dz Stiffness</Typography>
          </TableCell>
        </TableRow>
      </TableHead>
      
      <TableBody>
        {Object.keys(tableData).map((node) => (
          <TableRow key={node}>
            <TableCell>
              <Typography>{node}</Typography>
            </TableCell>
            <TableCell>
            <Typography>{tableData[node].Dx.toFixed(4)}</Typography>
            </TableCell>
            <TableCell>
            <Typography>{tableData[node].Dy.toFixed(4)}</Typography>
            </TableCell>
            <TableCell>
            <Typography>{tableData[node].Dz.toFixed(4)}</Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {/* </Scrollbars> */}
    </Table>
    
  );
}; 

export default ComponentsTableBundle;