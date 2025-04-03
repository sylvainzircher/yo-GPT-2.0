import Link from "next/link";
import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CodeBlock } from "./code-block";

const components = {
  code: CodeBlock,
  pre: ({ children }) => <> {children} </>,
  p: ({ node, children, ...props }) => {
    return (
      <p className="mb-2 last:mb-0" {...props}>
        {children}
      </p>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li className="py-1 p-0 m-0 list-item" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className="list-disc ml-4 p-0 m-0" {...props}>
        {children}
      </ul>
    );
  },
  ol: ({ node, children, ...props }) => {
    return (
      <ol className="list-decimal ml-4 p-0 m-0 space-y-1" {...props}>
        {children}
      </ol>
    );
  },
  hr: ({ node, children, ...props }) => {
    return <hr className="border-neutral-content" {...props} />;
  },
  strong: ({ node, children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }) => {
    return (
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },
  // 🆕 Table support
  table: ({ node, children, ...props }) => {
    return (
      <div className="overflow-x-auto">
        <table
          className="table-auto border-collapse border border-base-300 w-full my-2"
          {...props}
        >
          {children}
        </table>
      </div>
    );
  },
  thead: ({ node, children, ...props }) => {
    return (
      <thead className="bg-base-200 font-semibold text-sm" {...props}>
        {children}
      </thead>
    );
  },
  tbody: ({ node, children, ...props }) => {
    return <tbody {...props}>{children}</tbody>;
  },
  tr: ({ node, children, ...props }) => {
    return (
      <tr className="border border-base-300 text-sm" {...props}>
        {children}
      </tr>
    );
  },
  th: ({ node, children, ...props }) => {
    return (
      <th
        className="border border-base-300 px-4 py-2 text-left bg-base-200 text-sm"
        {...props}
      >
        {children}
      </th>
    );
  },
  td: ({ node, children, ...props }) => {
    return (
      <td className="border border-base-300 px-4 py-2 text-sm" {...props}>
        {children}
      </td>
    );
  },
};

const remarkPlugins = [remarkGfm];

const rehypePlugins = [rehypeRaw];

const NonMemoizedMarkdown = ({ children }) => {
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      // rehypePlugins={rehypePlugins}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
};

// export const Markdown = memo(
//   NonMemoizedMarkdown,
//   (prevProps, nextProps) => prevProps.children === nextProps.children
// );
export const Markdown = memo(NonMemoizedMarkdown);
