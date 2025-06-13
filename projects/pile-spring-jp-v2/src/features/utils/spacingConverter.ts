// space 문자열을 number[]로 변환하는 유틸리티 함수
const parseSpaceInput = (input: string): number[] => {
  if (!input) return [];

  const parts = input.split(",");
  const result: number[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes("@")) {
      const [count, value] = trimmed.split("@");
      const repeatCount = parseInt(count);
      const numValue = parseFloat(value);

      for (let i = 0; i < repeatCount; i++) {
        result.push(numValue);
      }
    } else {
      result.push(parseFloat(trimmed));
    }
  }

  return result;
};

// number[]를 문자열로 변환하는 함수
const formatSpaceDisplay = (spaceArray: number[]): string => {
  if (!spaceArray.length) return "";

  // 연속된 같은 숫자들을 그룹화
  const groups: { value: number; count: number }[] = [];
  let currentValue = spaceArray[0];
  let currentCount = 1;

  for (let i = 1; i < spaceArray.length; i++) {
    if (spaceArray[i] === currentValue) {
      currentCount++;
    } else {
      groups.push({ value: currentValue, count: currentCount });
      currentValue = spaceArray[i];
      currentCount = 1;
    }
  }
  groups.push({ value: currentValue, count: currentCount });

  // 그룹을 문자열로 변환
  return groups
    .map((group) =>
      group.count > 1 ? `${group.count}@${group.value}` : `${group.value}`
    )
    .join(", ");
};

export { parseSpaceInput, formatSpaceDisplay };
