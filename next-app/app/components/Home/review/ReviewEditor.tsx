'use client';

import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCallback, memo, useMemo } from 'react';
import debounce from 'lodash/debounce';

function ReviewEditor({
  initialContent,
  onChange,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialContent?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (content: any[]) => void;
}) {
  const editor = useCreateBlockNote({
    initialContent: initialContent && initialContent.length > 0 ? initialContent : undefined,
  });

  const debouncedOnChange = useMemo(
    () => debounce(onChange, 500),
    [onChange],
  );

  const handleEditorChange = useCallback(() => {
    debouncedOnChange(editor.document);
  }, [editor, debouncedOnChange]);

  return (
    <div className="w-full overflow-y-auto">
      <BlockNoteView editor={editor} onChange={handleEditorChange} theme="dark" color="black" />
    </div>
  );
}

export default memo(ReviewEditor);
