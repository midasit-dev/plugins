import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css'
import { GuideBox } from '@midasit-dev/moaui';

import { VarMessage } from './variables';
import { useRecoilValue } from 'recoil';


export default function MDReport({ mdData = "" }) {
	const message = useRecoilValue(VarMessage);

  return(
		<GuideBox>
			<ReactMarkdown
				remarkPlugins={[remarkMath]}
				rehypePlugins={[rehypeKatex]}
			>
				{message}
			</ReactMarkdown>
			<style>
				{`
					h1 {
						font-size: 1.5rem;
						font-weight: 600;
						color: #ff0000;
					}

					h2 {
						font-size: 1.25rem;
						font-weight: 600;
						color: #0000ff;
					}

					h3 {
						font-size: 1.125rem;
						font-weight: 600;
					}

					h4 {
						font-size: 1rem;
						font-weight: 600;
					}

					h5 {
						font-size: 0.875rem;
						font-weight: 600;
					}

					h6 {
						font-size: 0.75rem;
						font-weight: 600;
					}

					p {
						font-size: 0.8rem;
					}

					ul {
						font-size: 0.8rem;
					}

					br {
						margin: 1;
					}
				`}
			</style>
		</GuideBox>
  )

}