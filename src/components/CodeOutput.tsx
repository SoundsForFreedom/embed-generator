import * as React from "react";

interface CodeOutputProps {
  code: string;
}

const CodeOutput = React.forwardRef<HTMLDivElement, CodeOutputProps>(({ code }, ref) => {
  return (
    <div ref={ref} className="relative">
      <pre className="bg-foreground text-primary-foreground p-4 rounded-2xl overflow-x-auto text-xs md:text-sm font-mono max-h-96 overflow-y-auto">
        <code>{code}</code>
      </pre>

      {/* Line numbers overlay hint */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-primary/20 rounded text-xs text-primary-foreground/60">
        {code.split("\n").length} lines
      </div>
    </div>
  );
});

CodeOutput.displayName = "CodeOutput";

export default CodeOutput;

