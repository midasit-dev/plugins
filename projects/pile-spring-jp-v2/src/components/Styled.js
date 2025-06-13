import { __assign, __read } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { styled } from "@mui/material/styles";
import MoaStyledComponent from "../../Style/MoaStyled";
import React, { useEffect, useState } from "react";
import DropList from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import Color from "../../Style/Color";
import Font from "../../Style/Font";
var useDroplistOpenCloseEffect = function () {
  var _a = __read(React.useState(false), 2),
    isDroplistOpen = _a[0],
    setIsDroplistOpen = _a[1];
  var truncateText = React.useCallback(
    function (text, maxLength) {
      if (text === undefined) {
        return "";
      }
      if (isDroplistOpen) {
        return text;
      }
      if (maxLength !== undefined && text.length > maxLength) {
        return text.slice(0, maxLength) + "...";
      }
      return text;
    },
    [isDroplistOpen]
  );
  return {
    isDroplistOpen: isDroplistOpen,
    setIsDroplistOpen: setIsDroplistOpen,
    truncateText: truncateText,
  };
};
var StyledComponent = styled(function (props) {
  var _a;
  var id = props.id,
    itemList = props.itemList,
    width = props.width,
    value = props.value,
    onChange = props.onChange,
    defaultValue = props.defaultValue,
    backgroundColor = props.backgroundColor,
    listWidth = props.listWidth,
    maxLength = props.maxLength;
  //정방향 map 생성
  var _b = __read(useState(new Map()), 2),
    itemMap = _b[0],
    setItemMap = _b[1];
  useEffect(
    function () {
      if (itemList instanceof Function) {
        setItemMap(itemList());
      } else if (itemList instanceof Array) {
        setItemMap(new Map(itemList));
      } else if (itemList instanceof Map) {
        setItemMap(itemList);
      } else {
        console.error("itemList is not a Map or a function that returns a Map");
      }
    },
    [itemList]
  );
  //역방향 map 생성
  var _c = __read(useState(new Map()), 2),
    reverseItemMap = _c[0],
    setReverseItemMap = _c[1];
  useEffect(
    function () {
      var reverseMap = new Map();
      itemMap.forEach(function (value, key) {
        return reverseMap.set(value, key);
      });
      setReverseItemMap(reverseMap);
    },
    [itemMap]
  );
  var _d = __read(React.useState(0), 2),
    parentWidthInPixels = _d[0],
    setParentWidthInPixels = _d[1];
  var parentRef = React.useRef(null);
  React.useEffect(
    function () {
      if (parentRef.current) {
        setParentWidthInPixels(parentRef.current.offsetWidth);
      }
    },
    [width]
  );
  var _e = useDroplistOpenCloseEffect(),
    truncateText = _e.truncateText,
    isDroplistOpen = _e.isDroplistOpen,
    setIsDroplistOpen = _e.setIsDroplistOpen;
  return _jsx("div", {
    id: id,
    "data-current-value":
      (_a = reverseItemMap.get(value)) !== null && _a !== void 0 ? _a : "error",
    children: _jsx(FormControl, {
      ref: parentRef,
      sx: { width: width, maxHeight: "1.75rem" },
      children: _jsxs(DropList, {
        defaultValue: defaultValue,
        autoWidth: true,
        value: value,
        sx: {
          "& .MuiOutlinedInput-input.MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            alignSelf: "stretch",
            padding: "0.375rem 0.375rem 0.375rem 0.625rem",
            //font
            color: Color.text.secondary,
            fontFeatureSettings: Font.fontFeatureSettings,
            //background color
            backgroundColor: backgroundColor || Color.primary.white,
          },
          height: "1.75rem",
        },
        onChange: onChange,
        disabled: props === null || props === void 0 ? void 0 : props.disabled,
        displayEmpty: (
          props === null || props === void 0 ? void 0 : props.placeholder
        )
          ? true
          : false,
        open: isDroplistOpen,
        onOpen: function () {
          return setIsDroplistOpen(true);
        },
        onClose: function () {
          return setIsDroplistOpen(false);
        },
        children: [
          (props === null || props === void 0 ? void 0 : props.placeholder) &&
            _jsx(MenuItem, {
              disabled: true,
              value: "",
              sx: {
                display: "flex",
                padding: "0.25rem 0.625rem",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.625rem",
                alignSelf: "stretch",
                minHeight: "1.75rem",
                width: listWidth || "".concat(parentWidthInPixels, "px"),
                height: "1.75rem",
                //font
                color: Color.text.secondary,
                fontFeatureSettings: Font.fontFeatureSettings,
              },
              children: _jsx("em", {
                children: "".concat(
                  truncateText(
                    props === null || props === void 0
                      ? void 0
                      : props.placeholder,
                    maxLength || undefined
                  )
                ),
              }),
            }),
          Array.from(itemMap.keys()).map(function (key, index) {
            if (key === "subheader")
              return _jsx(
                ListSubheader,
                {
                  sx: {
                    display: "flex",
                    padding: "0.25rem 0.625rem",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "0.625rem",
                    alignSelf: "stretch",
                    height: "1.75rem",
                    width: "".concat(parentWidthInPixels, "px"),
                    //font
                    color: Color.text.secondary,
                    fontFeatureSettings: Font.fontFeatureSettings,
                  },
                  children: itemMap.get(key),
                },
                "subheader" + itemMap.get(key) + index
              );
            return _jsx(
              MenuItem,
              {
                value: itemMap.get(key),
                sx: {
                  display: "flex",
                  padding: "0.25rem 0.625rem",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.625rem",
                  alignSelf: "stretch",
                  minHeight: "1.75rem",
                  width: listWidth || "".concat(parentWidthInPixels, "px"),
                  height: "1.75rem",
                  //font
                  color: Color.text.secondary,
                  fontFeatureSettings: Font.fontFeatureSettings,
                  "&.Mui-selected": {
                    backgroundColor: "".concat(
                      Color.primary.enable_strock,
                      "!important"
                    ),
                  },
                  "&:hover": {
                    backgroundColor: "".concat(
                      Color.component.gray_light,
                      "!important"
                    ),
                  },
                },
                children: truncateText(key, maxLength || undefined),
              },
              "item" + itemMap.get(key) + index
            );
          }),
        ],
      }),
    }),
  });
})(function () {
  return {
    display: "flex",
    fullWidth: true,
    alignItems: "center",
    alignSelf: "stretch",
    borderRadius: "0.25rem",
    border: "1px solid ".concat(Color.component.gray),
    background: Color.primary.white,
  };
});
var ThemedComponent = function (props) {
  return _jsx(MoaStyledComponent, {
    children: _jsx(StyledComponent, __assign({}, props)),
  });
};
export default ThemedComponent;
