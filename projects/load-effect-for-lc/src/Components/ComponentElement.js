import React from "react";
import {
  GuideBox,
  Button,
  Typography,
  // TextField,
} from "@midasit-dev/moaui";
import { TextField } from "@mui/material";
import { GetElementNumbers } from "../Workers/GetElementNumber";
import { useSnackbar } from "notistack";
import { loadData } from "../utils";
import { BeamType } from "../Workers/BeamType";

const ElementList = ({ element, onElementSelect = () => {} }) => {
  const DefaultElements = {
    elements: element,
  };
  const { enqueueSnackbar } = useSnackbar();
  const [selectedElements, setSelectedElements] = React.useState(
    DefaultElements.elements
  );

  const FetchingElements = async () => {
    const FetchingResults = await GetElementNumbers();
    const FetchingBeamType = await BeamType();

    console.log("FetchingResults", FetchingResults);
    console.log("FetchingBeamType", FetchingBeamType);

    if (FetchingResults.length === 0) {
      setSelectedElements(""); // 선택된 요소 초기화
      enqueueSnackbar("There is no element. Select An Element", {
        variant: "error",
        autoHideDuration: 1500,
      });
      throw Error("No element selected");
    }

    console.log("FetchingResults의 타입", typeof FetchingResults); // object
    console.log("FetchingBeamType의 타입", typeof FetchingBeamType); // object

    const beamElement = FetchingResults.find((element) =>
      FetchingBeamType.includes(element)
    );

    console.log("beamElement:", beamElement);

    if (beamElement === undefined || !beamElement) {
      enqueueSnackbar("None of the selected elements are beams.", {
        variant: "error",
        autoHideDuration: 1500,
      });
      throw Error("None of the selected elements are beams");
    }
    if (FetchingResults.length > 1) {
      enqueueSnackbar(
        "Multiple elements are selected. A beam element is selected.",
        { variant: "warning", autoHideDuration: 1500 }
      );
    }

    setSelectedElements(beamElement);
    enqueueSnackbar(`No.${beamElement} is imported`, {
      variant: "success",
      autoHideDuration: 1500,
    }); // 성공 메시지 추가
    return beamElement; // 첫 번째 BEAM 요소 반환
  };

  const SetElementData = async () => {
    try {
      const element = await FetchingElements();
      handleGetElement(element); // 선택된 요소를 가져오기 위한 함수 호출
      onElementSelect("element", element); // 선택된 요소를 상위 컴포넌트로 전달
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleGetElement = React.useCallback(
    async (element) => {
      const targetUrl1 = `/view/select?ele_list=${element}`;
      const result1 = await loadData(targetUrl1);

      const targetUrl2 = `/db/elem/${element}`;
      const result2 = await loadData(targetUrl2);

      if (result1 && result2) {
        console.log("imported data:", { result1, result2 });
      } else {
        enqueueSnackbar("Failed to retrieve data", {
          variant: "error",
          autoHideDuration: 1500,
        });
      }
    },
    [enqueueSnackbar]
  );

  // 2025-03-10 Jay 추가 작업
  // 요청사항 -> Import로 요소를 가져오는게 아니라 직접 입력할 수도 있게 해달라.
  // TextField Disabled -> Enabled로 변경
  // TextFiled onChange -> handleInputChange 함수로 변경 (정수 1 ~ 999999까지만 입력 가능)
  // TextField onBlur -> handleBlur 함수로 변경 (입력한 요소가 존재하는지 확인) -> onBlur를 쓰기 위해, Material UI로 TextField 교체 (CSS 따로 적용)

  const handleInputChange = (e) => {
    console.log("Chainging");
    const value = e.target.value;
    const numericValue = Number(value);

    if (
      value === "" ||
      (Number.isInteger(numericValue) &&
        numericValue >= 1 &&
        numericValue <= 999999)
    ) {
      setSelectedElements(value);
    } else {
      enqueueSnackbar("Please enter a  valid element number (1 - 999999).", {
        variant: "warning",
        autoHideDuration: 1500,
      });
    }
  };

  const handleBlur = async () => {
    try {
      const FetchingBeamType = await BeamType();
      const beamElement = Number(selectedElements);

      if (FetchingBeamType.includes(beamElement)) {
        handleGetElement(beamElement); // 선택된 요소를 가져오기 위한 함수 호출
        onElementSelect("element", beamElement); // 선택된 요소를 상위 컴포넌트로 전달
      } else {
        setSelectedElements("");
        enqueueSnackbar("The entered element does not exist.", {
          variant: "error",
          autoHideDuration: 1500,
        });
      }
    } catch (error) {
      setSelectedElements("");
      enqueueSnackbar("The entered element does not exist.", {
        variant: "error",
        autoHideDuration: 1500,
      });
    }
  };

  return (
    <GuideBox column width="100%" verCenter horLeft spacing={2}>
      <Typography variant="h1">Target Element</Typography>
      <GuideBox row spacing={2} width="100%" verCenter horSpaceBetween>
        <TextField
          width="75%"
          value={selectedElements}
          disabled={false}
          type="number"
          onChange={handleInputChange}
          inputProps={{
            onBlur: handleBlur,
          }}
          InputProps={{
            style: { height: "28px" },
          }}
        />
        <Button variant="contained" width="6%" onClick={SetElementData}>
          Import
        </Button>
      </GuideBox>
    </GuideBox>
  );
};

export default ElementList;
