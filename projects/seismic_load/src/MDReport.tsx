import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css'
import { MDResult } from './Components/variables';
import { useRecoilState } from 'recoil';
import { GuideBox } from '@midasit-dev/moaui';

const MDReport=()=> {

  const [mDResult, setMDResult] = useRecoilState(MDResult);
  console.log(mDResult)

  const exampleMarkdown = `
  # 1. Test Chapter

  (1) Test Paragraph  
  Test Line : 11  

  # 2. Test Chapter2
    `;
  return(
    <GuideBox width={600}>
        <ReactMarkdown>
        {exampleMarkdown}
        </ReactMarkdown>
    </GuideBox>
  )

}

export default MDReport;