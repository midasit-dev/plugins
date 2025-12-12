import React from 'react'; 
import { Dialog, IconButton, Icon } from "@midasit-dev/moaui";

const ComponentsDialogHelpIconButton = ({ open, setOpen }) => {
 const handleIconClick = (event) => {
    event.preventDefault();
    setOpen(true);
  };

  const HelpDialog = (props) => {
    return (
      <Dialog
        open={props.open}
        setOpen={props.setOpen}
        json={{
          type: 'help',
          data: {
            titleText: 'Help Guide',
            body: [
              {
                type: 'single',
                title: 'Load Combination',
                content: 'This section allows you to select load combinations from the available options.'
              },
              {
                type: 'single',
                title: 'Elements_ID',
                content: 'This field displays the selected elements.'
              },
              {
                type: 'single',
                title: 'Parts',
                content: 'This section allows you to select parts (e.g., I, J) for the analysis.'
              },
              {
                type: 'single',
                title: 'Select Components to Display',
                content: 'This section allows you to select the components (e.g., Axial, Torsion) to display in the results.'
              },
              {
                type: 'single',
                title: 'Select Excel file to import data',
                content: 'This switch enables the option to select an Excel file to import data.'
              },
              {
                type: 'single',
                title: 'Choose File Button',
                content: 'Click this button to choose an Excel file from your system.'
              },
              {
                type: 'single',
                title: 'Enter cell range',
                content: 'Enter the cell range (e.g., A1) where the data should be imported in the Excel file.'
              },
              {
                type: 'single',
                title: 'Refresh Button',
                content: 'Click this button to refresh the data and reset the selections.'
              },
              {
                type: 'single',
                title: 'Get Forces Button',
                content: 'Click this button to fetch the forces based on the selected options.'
              }
            ]
          }
        }}
      />
    );
  }

  return (
    <>
      <IconButton transparent type="button" onClick={handleIconClick}>
        <Icon iconName="Help" />
      </IconButton>
      <HelpDialog open={open} setOpen={setOpen} />
    </>
  )
}

export default ComponentsDialogHelpIconButton;