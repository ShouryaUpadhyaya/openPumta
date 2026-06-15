'use client';

import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCallback, useEffect } from 'react';
import { useUpdateTextBoxContent } from '@/hooks/useTextBoxes';

export default function BlockEditor({
  initialContent,
  textBoxId,
  spaceId,
}: {
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
    <div className="w-full h-full overflow-y-auto">
      <BlockNoteView
        editor={editor}
        onChange={onChange}
        theme="light" // Or you can dynamically match system theme
      />
    </div>
  );
}
