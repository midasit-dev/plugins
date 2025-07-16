/**
 * @fileoverview 공간 간격 문자열을 숫자 배열로 변환하는 유틸리티 함수
 */

/**
 * 공간 간격 문자열을 숫자 배열로 변환하는 유틸리티 함수
 *
 * @example
 * parseSpaceInput("100, 3@200, 300") // [100, 200, 200, 200, 300]
 * parseSpaceInput("2@150") // [150, 150]
 * parseSpaceInput("") // []
 * parseSpaceInput("0", { emptyOnSingleZero: true }) // []
 *
 */
export const parseSpaceInput = (
  input: string,
  options: { emptyOnSingleZero?: boolean } = {}
): number[] => {
  const { emptyOnSingleZero = false } = options;

  // 빈 입력 처리
  if (!input) return [];

  // 쉼표로 분리하여 각 부분 처리
  const parts = input.split(",");
  const result: number[] = [];

  for (const part of parts) {
    const trimmed = part.trim();

    // 빈 부분 건너뛰기
    if (!trimmed) continue;

    // 반복 구문 처리 (예: "3@100")
    if (trimmed.includes("@")) {
      const [count, value] = trimmed.split("@");
      const repeatCount = parseInt(count);
      const numValue = parseFloat(value);

      // 유효성 검사: repeatCount가 양의 정수이고 numValue가 유효한 숫자인지 확인
      if (
        !isNaN(repeatCount) &&
        !isNaN(numValue) &&
        repeatCount > 0 &&
        Number.isInteger(repeatCount)
      ) {
        // 지정된 횟수만큼 값 반복 추가
        for (let i = 0; i < repeatCount; i++) {
          result.push(numValue);
        }
      }
      // 유효하지 않은 경우 해당 부분은 무시하고 계속 진행
    } else {
      // 단일 값 처리
      const numValue = parseFloat(trimmed);
      if (!isNaN(numValue)) {
        result.push(numValue);
      }
      // NaN인 경우 해당 부분은 무시하고 계속 진행
    }
  }

  // 0 하나만 있는 경우 빈 배열로 처리 (옵션)
  if (emptyOnSingleZero && result.length === 1 && result[0] === 0) {
    return [];
  }

  return result;
};

/**
 * 숫자 배열을 공간 간격 문자열로 변환하는 함수
 *
 * @example
 * formatSpaceDisplay([100, 200, 200, 200, 300]) // "100, 3@200, 300"
 * formatSpaceDisplay([150, 150]) // "2@150"
 * formatSpaceDisplay([]) // ""
 *
 */
export const formatSpaceDisplay = (spaceArray: number[]): string => {
  // 빈 배열 처리
  if (!spaceArray.length) return "";

  // 연속된 같은 숫자들을 그룹화
  const groups: { value: number; count: number }[] = [];
  let currentValue = spaceArray[0];
  let currentCount = 1;

  // 배열을 순회하며 연속된 같은 값들을 그룹화
  for (let i = 1; i < spaceArray.length; i++) {
    if (spaceArray[i] === currentValue) {
      currentCount++;
    } else {
      // 다른 값이 나오면 현재 그룹을 저장하고 새 그룹 시작
      groups.push({ value: currentValue, count: currentCount });
      currentValue = spaceArray[i];
      currentCount = 1;
    }
  }

  // 마지막 그룹 추가
  groups.push({ value: currentValue, count: currentCount });

  // 그룹을 문자열로 변환
  // count가 1보다 크면 반복 구문 사용, 아니면 단일 값
  return groups
    .map((group) =>
      group.count > 1 ? `${group.count}@${group.value}` : `${group.value}`
    )
    .join(", ");
};
