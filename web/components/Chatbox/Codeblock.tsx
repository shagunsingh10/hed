import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

const getLanguageFromClassName = (className: string | undefined) => {
  if (!className) return "text";
  if (className.startsWith("language-")) {
    return className.substring("language-".length).toLowerCase();
  } else {
    return className.toLowerCase();
  }
};

const CodeBlock = (props: any) => {
  const language = getLanguageFromClassName(props.className);
  const hasLang = /language-(\w+)/.exec(props.className || "");

  return hasLang ? (
    <>
      <SyntaxHighlighter language={language} style={oneDark}>
        {props.children}
      </SyntaxHighlighter>
    </>
  ) : (
    <code className={props.className} {...props} />
  );
};

export default CodeBlock;
