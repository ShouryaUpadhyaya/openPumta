'use client';

import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCallback, memo, useMemo, ContextType } from 'react';
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
    <div className="w-full overflow-y-auto ">
      <BlockNoteView editor={editor} onChange={onChange} theme="dark" color="black" />
    </div>
  );
}

export default memo(BlockEditor);
