import { Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@midasit-dev/moaui"; 

const ComponentsTableBundle = () => {
  return (
    <Table padding='normal'>
      <TableHead>
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
        <TableRow>
          <TableCell>
            <Typography>body 1</Typography>
          </TableCell>
          <TableCell>
            <Typography>body 2</Typography>
          </TableCell>
          <TableCell>
            <Typography>body 3</Typography>
          </TableCell>
          <TableCell>
            <Typography>body 4</Typography>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}; 

export default ComponentsTableBundle;