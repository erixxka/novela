import { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import {
  RichText,
  Toolbar,
  useEditorBridge,
  type EditorBridge,
} from '@10play/tentap-editor';

type RichTextEditorProps = {
  initialContent?: Record<string, unknown> | null;
  onReady?: (editor: EditorBridge) => void;
  editable?: boolean;
};

export function RichTextEditor({
  initialContent,
  onReady,
  editable = true,
}: RichTextEditorProps) {
  const editor: EditorBridge = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: (initialContent as any) ?? undefined,
    editable,
    editorStyle: 'body { padding: 0 20px 24px; } p { margin: 0; padding: 6px 0; }',
  });

  useEffect(() => {
    onReady?.(editor);
  }, [editor, onReady]);

  return (
    <View className="flex-1">
      <RichText editor={editor} />
      {editable ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
          <Toolbar editor={editor} />
        </KeyboardAvoidingView>
      ) : null}
    </View>
  );
}
