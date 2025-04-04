import React, { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { CopyIcon, CheckIcon } from "lucide-react";

export function CodeBlock({ inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);
  const match = className ? className.match(/language-(\w+)/) : null;
  const language = match ? match[1] : "plaintext";

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // Reset "Copied!" after 1.5s
  };

  // If it's an inline code snippet, just style it without highlighting
  if (inline) {
    return (
      <code className="text-xs py-0.5 px-1 bg-base-200 rounded-md" {...props}>
        {children}
      </code>
    );
  }

  if (language === "plaintext") {
    return (
      <span
        className="flex flex-row text-sm bg-base-200 p-1 rounded-lg"
        style={{ display: "inline" }}
        {...props}
      >
        {children}
      </span>
    );
  }

  // If a language is detected, apply syntax highlighting
  return language ? (
    <Highlight
      theme={themes.dracula}
      code={String(children).trim()}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} whitespace-pre-wrap break-words text-sm p-4 w-full overflow-x-auto rounded-xl`}
          style={style}
          {...props}
        >
          <div className="relative border-b pb-2 mb-4 text-xs">
            <div className="flex justify-between items-center px-4">
              <span className="font-semibold ">{language.toUpperCase()}</span>
              <button
                onClick={handleCopy}
                className="flex items-center text-gray-400 hover:text-gray-200 transition"
              >
                {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                <span className="ml-1">{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  ) : (
    // If no language is detected, render a basic <pre><code> block
    <pre className="p-4 rounded-xl overflow-x-auto" {...props}>
      <code>{children}</code>
    </pre>
  );
}
