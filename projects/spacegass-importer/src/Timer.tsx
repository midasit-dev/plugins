import React, { useState, useEffect } from 'react';
import Moment from 'react-moment';

const TimerExample = () => {
  // 시작 시간을 현재 시간으로 설정
  const [startTime, setStartTime] = useState<any>(null);
  // 경과 시간을 밀리초 단위로 저장할 상태
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // 시작 시간을 현재 시간으로 설정
    const start = new Date();
    setStartTime(start);

		return () => {
			setStartTime(null);
			setElapsedTime(0);
		}
  }, []);

  useEffect(() => {
    // startTime이 설정된 후에만 타이머를 시작
    if (startTime) {
      const timer = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime());
      }, 1000);

      // 컴포넌트가 언마운트될 때 타이머를 정리
      return () => clearInterval(timer);
    }
  }, [startTime]);

  return (
    <div>
      {startTime && (
        <Moment duration={0} date={elapsedTime} format="m[m] s[s]" />
      )}
    </div>
  );
};

export default TimerExample;
