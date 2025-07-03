'use client'

// MUI Imports
import Divider from '@mui/material/Divider'

// Third-party imports
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import type { Editor } from '@tiptap/core'

// Components Imports
import CustomIconButton from '@core/components/mui/IconButton'

// Editor Toolbar Component
const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null
  }

  return (
    <div className='flex flex-wrap gap-x-3 gap-y-1 p-5'>
      {/* Bold */}
      <CustomIconButton
        {...(editor.isActive('bold') && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <i className='ri-bold' />
      </CustomIconButton>
      {/* Underline */}
      <CustomIconButton
        {...(editor.isActive('underline') && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <i className='ri-underline' />
      </CustomIconButton>
      {/* Italic */}
      <CustomIconButton
        {...(editor.isActive('italic') && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i className='ri-italic' />
      </CustomIconButton>
      {/* Strike */}
      <CustomIconButton
        {...(editor.isActive('strike') && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <i className='ri-strikethrough' />
      </CustomIconButton>
      {/* Align Left */}
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'left' }) && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <i className='ri-align-left' />
      </CustomIconButton>
      {/* Align Center */}
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'center' }) && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <i className='ri-align-center' />
      </CustomIconButton>
      {/* Align Right */}
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'right' }) && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <i className='ri-align-right' />
      </CustomIconButton>
      {/* Align Justify */}
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'justify' }) && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      >
        <i className='ri-align-justify' />
      </CustomIconButton>
    </div>
  )
}

const EditorBasic = ({ content, onContentChange }: { content?: string; onContentChange: (value: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write something here...', // Placeholder text
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline
    ],

    content:
      content ??
      `
      <p>
        This is a radically reduced version of tiptap
      </p>
    `
  })

  // Handle editor content change
  const handleContentChange = () => {
    const editorContent = editor?.getHTML() || ''
    onContentChange(editorContent) // Update the parent component state
  }

  return (
    <>
      <label className='block text-lg font-medium text-gray-700 mb-2'>
        Description
      </label>
      <div className='border rounded-md'>
        {/* Editor Toolbar */}
        <EditorToolbar editor={editor} />

        {/* Divider */}
        <Divider />

        {/* Editor Content with Placeholder */}
        <EditorContent
          editor={editor}
          onPaste={handleContentChange} // Call when content updates
          className='p-4 bg-white rounded-b-md min-h-[200px] overflow-auto text-sm'
        />
      </div>
    </>
  )
}

export default EditorBasic
