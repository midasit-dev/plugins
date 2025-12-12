import { GuideBox, IconButton, List, ListItem, ListItemButton, Typography } from '@midasit-dev/moaui';
import Checkbox from "@midasit-dev/moaui/Components/Check";
import { Box } from '@mui/material';
import * as React from 'react';

export default function CheckboxList({ jsonObject, setJsonObject, selected, setSelected }) {
    const [checked, setChecked] = React.useState([]);

    React.useEffect(() => {
        setChecked(selected);
    }, [selected]);

    const handleToggle = (key) => () => {
        const currentIndex = checked.indexOf(key);
        const newChecked = [...checked];
        const newSelected = [...selected];

        if (currentIndex === -1) {
            newChecked.push(key);
            newSelected.push(key);
        } else {
            newChecked.splice(currentIndex, 1);
            const selectedIndex = newSelected.indexOf(key);
            newSelected.splice(selectedIndex, 1);
        }

        setChecked(newChecked);
        setSelected(newSelected);
    };

    const handleDelete = (key) => () => {
        const { [key]: _, ...rest } = jsonObject;
        setJsonObject(rest);

        if (checked.includes(key)) {
            setChecked(checked.filter(item => item !== key));
        }

        if (selected.includes(key)) {
            setSelected(selected.filter(item => item !== key));
        }
    };

    const getName = (key) => {
        const json = jsonObject[key];
        if (!json["LoadCombination"] || json["LoadCombination"]["LC"])
            return key;
        const lcNames = json["LoadCombination"]["LC"];
        let text = `${key}(${lcNames.length}:${lcNames})`;
        const limit = 37;
        if (text.length > limit)
            text = text.substring(0, limit - 3) + "...";
        return text;
    };

    const keys = Object.keys(jsonObject);

    return (
        <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
            <List dense sx={{ width: '100%' }}>
                {keys.map((key, index) => {
                    const labelId = `checkbox-list-label-${index}`;

                    return (
                        <ListItem
                            key={index}
                            sx={{
                                width: '100%',
                                padding: '4px 0',
                                margin: 0,
                            }}
                            dense
                        >
                            <ListItemButton
                                role={undefined}
                                onClick={handleToggle(key)}
                                sx={{
                                    width: '100%',
                                    padding: '0px',
                                }}
                                dense
                            >
                                <GuideBox row verCenter horSpaceBetween width={'100%'}>
                                    <GuideBox row verCenter horLeft>
                                        <Checkbox
                                            edge="start"
                                            checked={checked.indexOf(key) !== -1}
                                            tabIndex={-1}
                                            disableRipple
                                            inputProps={{ 'aria-labelledby': labelId }}
                                        />
                                        {/* <Typography>{getName(key)}</Typography> */}
                                        <Typography>{key}</Typography>
                                    </GuideBox>

                                    <IconButton edge="end" aria-label="delete" transparent onClick={handleDelete(key)}>
                                        <img src={"svg/Delete.svg"} alt="icon" className="icon" />
                                    </IconButton>
                                </GuideBox>
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
}
