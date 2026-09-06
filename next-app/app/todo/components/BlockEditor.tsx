'use client';

import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCallback, memo, useMemo } from 'react';
import { useUpdateTextBoxContent } from '@/hooks/useTextBoxes';
import debounce from 'lodash/debounce';

function BlockEditor({
  initialContent,
  textBoxId,
  spaceId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialContent: any[];
  textBoxId: number;
  spaceId: number;
}) {
  const updateContent = useUpdateTextBoxContent();

  const editor = useCreateBlockNote({
    initialContent: initialContent.length > 0 ? initialContent : undefined,
  });

  const debouncedSave = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      debounce((content: any) => {
        updateContent.mutate({
          id: textBoxId,
          spaceId,
          content,
        });
      }, 500),
    [textBoxId, spaceId, updateContent],
  );

  const onChange = useCallback(() => {
    debouncedSave(editor.document);
  }, [editor, debouncedSave]);

  return (
    // Override BlockNote's hardcoded background — let the parent bg-card show through, and force wrapping
    <div className="w-full max-w-full [&_.bn-editor]:!bg-transparent [&_.bn-container]:!bg-transparent [&_.bn-mantine]:!bg-transparent [&_.bn-editor]:break-words [&_.bn-block-content]:break-words overflow-hidden">
      <BlockNoteView editor={editor} onChange={onChange} theme="dark" />
    </div>
  );
}

export default memo(BlockEditor);
