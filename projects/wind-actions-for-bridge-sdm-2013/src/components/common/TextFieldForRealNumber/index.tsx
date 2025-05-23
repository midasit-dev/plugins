import React from "react";
import StyledComponent, { type StyledProps } from "./Styled";
import { GuideBox, Typography } from "@midasit-dev/moaui";

const TextField = (props: StyledProps) => {
  const _props = {
    autoFocus: false,
    type: "text",
    title: "",
    titlePosition: "left",
    error: false,
    disabled: false,
    spacing: 1,
    textAlign: "left",
    ...props,
  } as StyledProps;

  const WrappedStyles = {
    width: _props?.wrappedWidth || "auto",
    spacing: _props?.spacing,
    verCenter: true,
    horSpaceBetween: true,
  };

  return (
    <React.Fragment>
      {_props.title !== "" && _props.titlePosition === "label" && (
        <GuideBox {...WrappedStyles}>
          <GuideBox width="auto">
            <Typography>{`${_props.title}`}</Typography>
          </GuideBox>
          <GuideBox width={props?.width}>
            <StyledComponent {..._props} />
          </GuideBox>
        </GuideBox>
      )}
      {_props.title !== "" && _props.titlePosition === "left" && (
        <GuideBox {...WrappedStyles} row>
          <GuideBox width="auto">
            <Typography>{`${_props.title}`}</Typography>
          </GuideBox>
          <GuideBox width={props?.width}>
            <StyledComponent {..._props} />
          </GuideBox>
        </GuideBox>
      )}
      {_props.title !== "" && _props.titlePosition === "right" && (
        <GuideBox {...WrappedStyles} row>
          <GuideBox width={props?.width}>
            <StyledComponent {..._props} />
          </GuideBox>
          <GuideBox width="auto">
            <Typography>{`${_props.title}`}</Typography>
          </GuideBox>
        </GuideBox>
      )}
      {_props.title === "" && <StyledComponent {..._props} />}
    </React.Fragment>
  );
};

const SampleProps = {
  id: "",
  autoFocus: false,
  type: "text",
  placeholder: "Placeholder",
  title: "Title",
  titlePosition: "left",
  error: false,
  disabled: false,
  onChange: () => {},
  wrappedWidth: "150px",
  width: "100px",
  height: "30px",
  spacing: 1,
  textAlign: "left",
  multiline: false,
  rows: 1,
  maxRows: 1,
};

export default TextField;

export { type StyledProps as TextFieldProps, SampleProps as TextFieldSample };
