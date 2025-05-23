import { GuideBox, Typography, TextField, Color } from "@midasit-dev/moaui";
import React from "react";
import { debounce } from "lodash";

const CompTypographyAndTextField = (props: any) => {
  const {
    title,
    state,
    setState,
    error,
    disabled,
    blueTitle = false,
    placeholder = "Input value ...",
    height = 30,
  } = props;

  const [value, setValue] = React.useState(state);

  //for 디바운스!
  React.useEffect(() => {
    const debounceSetValue = debounce((newValue) => {
      setState(newValue);
    }, 500);

    debounceSetValue(value);

    // Cleanup the debounce function on component unmount
    return () => {
      debounceSetValue.cancel();
    };
  }, [value, setState]);

  return (
    <GuideBox width="100%" row horSpaceBetween>
      <GuideBox width="inherit" row horSpaceBetween verCenter height={height}>
        <Typography
          verCenter
          variant="h1"
          height={height}
          color={blueTitle ? Color.secondary.main : Color.text.primary}
        >
          {title}
        </Typography>
        <TextField
          error={error}
          width={200}
          height={height}
          placeholder={placeholder}
          onChange={(e: any) => setValue(e.target.value)}
          value={value}
          disabled={disabled}
        />
      </GuideBox>
    </GuideBox>
  );
};

export default CompTypographyAndTextField;
