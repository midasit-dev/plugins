import React from "react";
import m from "@midasit-dev/moaui";

import { Editor } from "@monaco-editor/react";

import GridLoader from "react-spinners/GridLoader";

import { motion } from "framer-motion";

import * as _ from "lodash";
import { enqueueSnackbar } from "notistack";

const App = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [content, setContent] = React.useState<string | null>(null);

  return (
    <m.GuideBox width={800} spacing={2} padding={2}>
			<m.VerifyDialog />
      <m.GuideBox row width="100%" horSpaceBetween verCenter>
        <m.Typography>
          Please insert the text file extracted from Spacegass
        </m.Typography>
        <m.GuideBox row verCenter spacing={2}>
          <input
            ref={inputRef}
            type="file"
            style={{ display: "none", }}
						accept=".txt"
          />
          <m.Button
            onClick={() => {
              if (!inputRef.current) return;
              inputRef.current.click();

              inputRef.current.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                  const content = e.target?.result;
                  setContent(content as string);
                };
                reader.readAsText(file);

								// Reset the file input value to allow selecting the same file again
								if (e.target instanceof HTMLInputElement) {
									e.target.value = ''; // 파일 이름 초기화
								}
              };
            }}
            color="negative"
          >
            Import (.txt)
          </m.Button>
          <m.Button
            onClick={() => {
              setContent(null);
            }}
          >
            Clear
          </m.Button>
        </m.GuideBox>
      </m.GuideBox>
      <TextEditor content={content} />
			<m.GuideBox width='100%' horRight verCenter>
				<m.Button onClick={() => {
					console.log('current content', content);
				}} color='negative'>Send to product</m.Button>
			</m.GuideBox>
    </m.GuideBox>
  );
};

export default App;

const TextEditor = (props: any) => {
  const { content } = props;

  const editorRef = React.useRef(null);

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
  }

  function handleEditorChange(value: any, event: any) {
    console.log("here is the current model value:", value, event);
    enqueueSnackbar(`Editor content changed. length (${value.length})`, {
      variant: "info",
    });
  }

  const debounceEditorChange = _.debounce(handleEditorChange, 1000);

  return (
    <m.GuideBox width="100%" height={300} center>
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
          transition: {
            duration: 0.5,
          },
        }}
        style={{
          width: "100%",
          height: 300,
        }}
      >
        <Editor
          height={300}
          defaultLanguage="text"
          defaultValue=""
          value={content}
          onMount={handleEditorDidMount}
          onChange={debounceEditorChange}
          loading={<GridLoader />}
        />
      </motion.div>
    </m.GuideBox>
  );
};
