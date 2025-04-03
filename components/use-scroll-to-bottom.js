import { useEffect, useRef } from "react";

export function useScrollToBottom(messages, isEditing) {
  const containerRef = useRef(null);
  const endRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    if (isEditing) return;

    // If there's no endRef yet, don't try to scroll
    if (!endRef.current) return;

    // Clear any existing scroll delay
    clearTimeout(scrollTimeoutRef.current);

    // Delay scroll for 200ms to avoid aggressive jumping
    scrollTimeoutRef.current = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 200);

    return () => {
      clearTimeout(scrollTimeoutRef.current);
    };
  }, [messages, isEditing]);

  return [containerRef, endRef];
}

// import { useEffect, useRef } from "react";

// export function useScrollToBottom(messages, isEditing) {
//   const containerRef = useRef(null);
//   const endRef = useRef(null);

//   useEffect(() => {
//     const container = containerRef.current;
//     const end = isEditing ? null : endRef.current;

//     if (container && end) {
//       // Immediately scrolls to the bottom when messages update and we are not in editing mode
//       end.scrollIntoView({ behavior: "smooth", block: "end" });
//       // MutationObserver watches for changes in the container.
//       // Whenever elements (messages) are added/removed, it instantly scrolls to the bottom.
//       const observer = new MutationObserver(() => {
//         end.scrollIntoView({ behavior: "instant", block: "end" });
//       });

//       // childList: true → Detects when new messages appear.
//       // subtree: true → Watches nested elements inside container.
//       // attributes: true → Detects attribute changes (e.g., class changes).
//       // characterData: true → Watches text updates.
//       observer.observe(container, {
//         childList: true,
//         subtree: true,
//         attributes: true,
//         characterData: true,
//       });

//       // Cleans up the observer when the component unmounts.
//       return () => observer.disconnect();
//     }
//   }, [messages, isEditing]);

//   return [containerRef, endRef];
// }
