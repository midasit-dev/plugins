import React from 'react';
import moaui from '@midasit-dev/moaui';

const App = () => {
	//Input을 커스텀 스타일링하기 어려워 DOM에 직접 접근하기 위해 useRef 사용합니다.
	const inputRef = React.useRef<HTMLInputElement>(null);

	//업로드 한 파일 이름을 표기 하기 위해 상태(변수)를 선언 합니다.
	const [ uploadedFileName, setUploadedFileName ] = React.useState<string>('none');

	return (
		<moaui.GuideBox width={550} spacing={3} padding={3} center fill='1'>
			
			{/** 제목 텍스트 */}
			<moaui.Typography variant='h1' size="large">
				Nastran BulkData (using pyNastran)
			</moaui.Typography>

			{/** 실질적인 업로드 태그 (모양이 별로여서 숨김처리) */}
			<input 
				ref={inputRef}
				type="file" 
				className='hidden' 
				onClick={(e: any) => {
					//같은 파일 재 선택 시, onChange가 동작하지 않는 걸 방지 하기 위해!
          e.target.value = null;
				}}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					const file = e.target.files?.[0];
					if (file) {
						const reader = new FileReader();
						reader.onload = (e: any) => {
							const contents = e.target?.result as string;
							try {
								if (contents) {
									setUploadedFileName(file.name);
									pyscript.interpreter.globals.get('process_file_content')(contents, file.name);
								}
							} catch (err) {
								console.error('변환 과정에 오류가 발생 했습니다.:', err);
							}
						};
						reader.readAsText(file);
					} else {
						console.error('파일이 선택되지 않았습니다.');
					}
				}}
				accept='.bdf'
			/>

			{/** 업로드 버튼 */}
			<moaui.Button 
				color='negative' 
				onClick={() => {
					//inputRef를 이용하여 버튼이 눌리면 input이 클릭되는 동작을 강제 합니다.
					if (inputRef.current) {
						//input 태그 클릭!
						inputRef.current.click();
					}
				}}
			>
				Import (.bdf) and update to Civil NX
			</moaui.Button>

			{/** 설명 텍스트 - 업로드 안했을 때 */}
			{uploadedFileName === 'none' &&
				<moaui.Typography color='disable'>
					Select a .bdf file to import.
				</moaui.Typography>
			}

			{/** 설명 텍스트 - 업로드 성공 시 */}
			{uploadedFileName !== 'none' &&
				<moaui.Typography color='#2979ff'>
					Conversion has been successfully completed. ({uploadedFileName})
				</moaui.Typography>
			}

			<moaui.GuideBox width='100%' center spacing={1}>
				<moaui.Typography id='step-start' variant='body1' />
				<moaui.Typography id='step-convert' variant='body1' />
				<moaui.Typography id='step-send-to-civil' variant='body1' />
				<moaui.Typography id='fileContent' variant='body1' />
				<moaui.Typography id='step-end' variant='body1' />
			</moaui.GuideBox>

		</moaui.GuideBox>
	);
}

export default App;