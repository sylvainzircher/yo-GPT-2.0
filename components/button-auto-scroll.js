import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function ButtonScrollDown({ endRef, isStreaming }) {
  const [showButton, setShowButton] = useState(false);
  const scrollerDivRef = useRef(null);

  const scrollToBottom = () => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  const hasScrollbar = (element) => {
    return element.scrollHeight > element.clientHeight;
  };

  useEffect(() => {
    scrollerDivRef.current = document.getElementById("scroller");
    const scrollerDiv = scrollerDivRef.current;
    let showButtonCondition = false;

    if (!scrollerDiv) return;

    const handleScroll = () => {
      if (hasScrollbar(scrollerDiv)) {
        const scrollDist =
          scrollerDiv.scrollHeight -
          scrollerDiv.clientHeight -
          scrollerDiv.scrollTop;
        showButtonCondition =
          (scrollDist <= 25 && scrollDist >= 0) || isStreaming ? false : true;
      } else {
        showButtonCondition = false;
      }

      setShowButton(showButtonCondition);
    };

    scrollerDiv.addEventListener("scroll", handleScroll);

    return () => scrollerDiv.removeEventListener("scroll", handleScroll);
  }, [isStreaming]);

  return (
    <div className="w-2/3">
      {showButton && (
        <button
          className="z-50 fixed bg-base-100 bottom-48 left-1/2 w-10 border rounded-full"
          onClick={scrollToBottom}
        >
          <ChevronDown size={20} className="mx-auto m-2" />
        </button>
      )}
    </div>
  );
}
