export const convertToNumber = (str) => {
    // 시도하여 문자열을 숫자로 변환
    const num = Number(str);

    // 숫자로 변환이 성공했는지 확인
    if (isNaN(num)) {
        // 변환이 실패하면 0을 반환
        return 0;
    }

    // 변환이 성공하면 변환된 숫자를 반환
    return num;
}