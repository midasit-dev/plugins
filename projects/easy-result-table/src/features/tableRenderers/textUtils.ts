/**
 * 텍스트를 최대 길이로 자르고 ... 을 추가하는 유틸리티 함수
 * @param text 원본 텍스트
 * @param maxLength 최대 길이 (문자 수)
 * @returns 잘린 텍스트 (필요시 ... 포함)
 */
export const truncateText = (text: string | number, maxLength: number): string => {
  if (text === null || text === undefined) return "";
  
  const textStr = String(text);
  
  if (textStr.length <= maxLength) {
    return textStr;
  }
  
  return textStr.substring(0, maxLength - 3) + "...";
};

/**
 * 셀 너비에 따라 적절한 최대 문자 수를 계산하는 함수
 * @param widthPercent 셀 너비 (퍼센트 문자열, 예: "10%")
 * @param fontSize 폰트 크기
 * @param isLandscape 가로 모드 여부
 * @returns 최대 문자 수
 */
export const calculateMaxChars = (
  widthPercent: string,
  fontSize: number = 7,
  isLandscape: boolean = false
): number => {
  // 퍼센트 값을 숫자로 변환
  const widthNum = parseFloat(widthPercent.replace("%", ""));
  
  // A4 페이지 너비 (포인트 단위)
  // 가로: 842pt - 80pt(패딩) = 762pt
  // 세로: 595pt - 80pt(패딩) = 515pt
  const pageWidth = isLandscape ? 762 : 515;
  
  // 실제 셀 너비 (포인트)
  const cellWidth = (pageWidth * widthNum) / 100;
  
  // 패딩 고려 (좌우 2pt씩 = 4pt)
  const contentWidth = cellWidth - 4;
  
  // 폰트 크기 기준 평균 문자 너비 (Courier 폰트 기준 약 0.6배)
  const avgCharWidth = fontSize * 0.6;
  
  // 최대 문자 수 계산
  const maxChars = Math.floor(contentWidth / avgCharWidth);
  
  return maxChars > 0 ? maxChars : 1;
};

