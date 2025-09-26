import { Scrollbars } from "rc-scrollbars";
import * as React from "react";
import { updateCheckState } from "../utils.js";

import Checkbox from "@midasit-dev/moaui/Components/Check";
import Stack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";

import { GuideBox } from "@midasit-dev/moaui";

const baseWidth = 12;
const innerWidth = baseWidth + "rem";

ListComponent.defaultProps = {
  checkList: [],
  loader: () => { },
  userData: { user: [] },
  width: "100%",
  height: '225px',
  singleSelect: false,
  allowNone: false,
  footer: null, // 추가된 footer prop
};

const isEmpty = (array) => {
  return array && array.length !== 0;
};

const ColoredContainer = (props) => (
  <Stack
    display="flex"
    justifyContent="center"
    alignItems="center"
    sx={{ height: "100%", backgroundColor: "#F5F4FF" }}
  >
    {props.children}
  </Stack>
);

const awaiter = async (setPending, setListData, func, userData) => {
  try {
    setPending(true);
    setListData(userData);
    setPending(false);
  } catch (_) {
    console.log(_);
  }
};

export function ListComponent(props) {
  const {
    checkList,
    setCheckList,
    doUpdate,
    setDoUpdate,
    Loader,
    label,
    userData,
    width,
    singleSelect,
    allowNone,
    footer, // 추가된 footer prop
  } = props;

  const [listData, setListData] = React.useState([]);
  const [isPending, setPending] = React.useState(false);

  React.useEffect(() => {
    awaiter(setPending, setListData, undefined, userData);
  }, [userData]);

  const changeCheckedList = (data) => {
    if (singleSelect) {
      if(allowNone && checkList.includes(data)){
        setCheckList([]);
      }
      else{
        setCheckList([data]);
      }
    } else {
      const newCheckList = [...checkList];
      if (newCheckList.includes(data)) {
        newCheckList.splice(newCheckList.indexOf(data), 1);
      } else {
        newCheckList.push(data);
      }
      setCheckList(newCheckList);
    }
  };

  React.useEffect(() => {
    if (doUpdate === "SELECT") {
      updateCheckState(setCheckList, listData);
    } else if (doUpdate === "DESELECT") {
      updateCheckState(setCheckList, []);
    } else if (doUpdate === "INIT") {
      updateCheckState(setCheckList, []);
      awaiter(setPending, setListData, undefined, userData);
    }
    setDoUpdate("");
  }, [doUpdate, setDoUpdate, setCheckList, listData, userData]);

  const isExistInCheckList = (data) => checkList.includes(data);
  const isFullyChecked = Boolean(listData === checkList);

  const handleOnClick = () => {
    updateCheckState(setCheckList, isFullyChecked ? [] : listData);
  };

  return (
    <Stack width={width} border="1px solid #edf0f2" height={props.height}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <ListItem key={label} disableGutters disablePadding>
          <div
            style={{
              paddingTop: "12px",
              paddingBottom: "0px",
              paddingLeft: "8px",
            }}
          >
            {label && (
              <Typography color="disable" variant="body2">
                {label}
              </Typography>
            )}
          </div>
        </ListItem>
      </Stack>
      <Stack sx={{ flex: 1, overflow: "hidden", height: "calc(100% - 40px)" }}>
        {isPending && (
          <ColoredContainer>
            <CircularProgress />
          </ColoredContainer>
        )}
        {!isPending && !isEmpty(listData) && (
          <ColoredContainer>
            <Typography>No Items.</Typography>
          </ColoredContainer>
        )}
        {!isPending && isEmpty(listData) && (
          <Scrollbars style={{ width: '100%', height: '100%' }} autoHide>
            <List dense>
              {listData.map((value) => (
                <ListItem
                  key={value}
                  disableGutters
                  disablePadding
                  sx={{ marginBottom: "-4px" }}
                >
                  <ListItemButton onClick={() => changeCheckedList(value)}>
                    <GuideBox width="100%" row horSpaceBetween verCenter>
                      <Typography>{value}</Typography>
                      <Checkbox
                        checked={isExistInCheckList(value)}
                        onClick={() => changeCheckedList(value)}
                      />
                    </GuideBox>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Scrollbars>
        )}
        {footer && (
          footer
        )}
      </Stack>

    </Stack>
  );
}
