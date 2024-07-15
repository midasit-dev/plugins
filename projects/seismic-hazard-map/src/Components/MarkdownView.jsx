// import remarkMath from 'remark-math'
// import rehypeKatex from 'rehype-katex'
// import ReactMarkdown from 'react-markdown';
// import 'katex/dist/katex.min.css'
import React, { useState, useEffect } from 'react';
import { Chip, GuideBox, Typography } from '@midasit-dev/moaui';
import { Skeleton } from '@mui/material';

import { VarMessage } from './variables';
import { useRecoilValue } from 'recoil';

import { motion } from 'framer-motion';

export default function MDReport({ mdData = "" }) {
	const message = useRecoilValue(VarMessage);

	const [isError, setIsError] = useState(false);
	const [errMessage, setErrMessage] = useState("");
	useEffect(() => {
		if ('error' in message) {
			setIsError(true);
			setErrMessage(message.error.message);
		} else {
			setIsError(false);
		}
	}, [message]);

	return (
    <motion.div
      key={new Date().getTime()}
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
    >
      {isError && <Typography>{errMessage}</Typography>}
      {!isError && (
        <GuideBox spacing={1} width='100%'>
					<GuideBox row spacing={1} horSpaceBetween width='100%' opacity={message.address_name ? 1 : .5}>
						<Chip label='Address' size="small" />
          	<Typography size='medium'>{message.address_name ?? <Skeleton width={200} height={30} />}</Typography>
					</GuideBox>
					<GuideBox row spacing={1} horSpaceBetween width='100%' opacity={message.latitude ? 1 : .5}>
						<Chip label='Latitude' size="small" />
						<Typography size='medium'>{message.latitude ?? <Skeleton width={100} height={30} />}</Typography>
					</GuideBox>
					<GuideBox row spacing={1} horSpaceBetween width='100%' opacity={message.longitude ? 1 : .5}>
						<Chip label='Longitude' size="small" />
						<Typography size='medium'>{message.longitude ?? <Skeleton width={100} height={30} />}</Typography>
					</GuideBox>
					<GuideBox row spacing={1} horSpaceBetween width='100%' opacity={message.msg_period ? 1 : .5}>
						<Chip label='Period' size="small" />
						<Typography size='medium'>{message.msg_period ?? <Skeleton width={100} height={30} />}</Typography>
					</GuideBox>
					<GuideBox row spacing={1} horSpaceBetween width='100%' opacity={message.interp_value ? 1 : .5}>
						<Chip label='Effective ground acceleration' size="small" severity="info" />
						<Typography size='medium' variant='h1' color="#3b86cb">{message.interp_value ?? <Skeleton width={50} height={30} />}</Typography>
					</GuideBox>
        </GuideBox>
      )}
    </motion.div>
  );
};

// export default function MDReport({ mdData = "" }) {
// 	const message = useRecoilValue(VarMessage);

// 	console.log(message);

//   return(
// 		<GuideBox>
// 			<ReactMarkdown
// 				remarkPlugins={[remarkMath]}
// 				rehypePlugins={[rehypeKatex]}
// 			>
// 				{message}
// 			</ReactMarkdown>
// 			<style>
// 				{`
// 					h1 {
// 						font-size: 1.5rem;
// 						font-weight: 600;
// 						color: #ff0000;
// 					}

// 					h2 {
// 						font-size: 1.25rem;
// 						font-weight: 600;
// 						color: #0000ff;
// 					}

// 					h3 {
// 						font-size: 1.125rem;
// 						font-weight: 600;
// 					}

// 					h4 {
// 						font-size: 1rem;
// 						font-weight: 600;
// 					}

// 					h5 {
// 						font-size: 0.875rem;
// 						font-weight: 600;
// 					}

// 					h6 {
// 						font-size: 0.75rem;
// 						font-weight: 600;
// 					}

// 					p {
// 						font-size: 0.8rem;
// 					}

// 					ul {
// 						font-size: 0.8rem;
// 					}

// 					br {
// 						margin: 1;
// 					}
// 				`}
// 			</style>
// 		</GuideBox>
//   )

// }