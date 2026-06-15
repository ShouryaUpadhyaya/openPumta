'use client';

import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCallback } from 'react';
import { useUpdateTextBoxContent } from '@/hooks/useTextBoxes';

export default function BlockEditor({
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

  const onChange = useCallback(() => {
    updateContent.mutate({
      id: textBoxId,
      spaceId,
      content: editor.document,
    });
  }, [editor, textBoxId, spaceId, updateContent]);

  return (
    <div className="w-full overflow-y-auto ">
      <BlockNoteView editor={editor} onChange={onChange} theme="dark" color="black" />
    </div>
  );
}
