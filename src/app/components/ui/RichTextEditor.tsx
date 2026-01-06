// src/app/components/ui/RichTextEditor.tsx
'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Undo,
  Redo,
  Pilcrow,
  Quote,
  Minus,
  Eye,
  EyeOff
} from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string, text: string) => void
  placeholder?: string
  label?: string
  error?: string
  required?: boolean
  minHeight?: string
  maxHeight?: string
  showPreview?: boolean
  disabled?: boolean
}

interface MenuButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

const MenuButton = ({ onClick, isActive, disabled, title, children }: MenuButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded transition-all duration-150 ${
      isActive
        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {children}
  </button>
)

interface MenuBarProps {
  editor: Editor | null
}

const MenuBar = ({ editor }: MenuBarProps) => {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  const setLink = useCallback(() => {
    if (!editor) return

    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      setShowLinkInput(false)
      return
    }

    // Add https if missing
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    setLinkUrl('')
    setShowLinkInput(false)
  }, [editor, linkUrl])

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
      {/* Text formatting */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300 dark:border-gray-600">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Gras (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italique (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </MenuButton>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-0.5 px-2 border-r border-gray-300 dark:border-gray-600">
        <MenuButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive('paragraph')}
          title="Paragraphe"
        >
          <Pilcrow className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Titre 2"
        >
          <Heading2 className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Titre 3"
        >
          <Heading3 className="w-4 h-4" />
        </MenuButton>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-0.5 px-2 border-r border-gray-300 dark:border-gray-600">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Liste \u00e0 puces"
        >
          <List className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Liste num\u00e9rot\u00e9e"
        >
          <ListOrdered className="w-4 h-4" />
        </MenuButton>
      </div>

      {/* Block elements */}
      <div className="flex items-center gap-0.5 px-2 border-r border-gray-300 dark:border-gray-600">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Citation"
        >
          <Quote className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Ligne horizontale"
        >
          <Minus className="w-4 h-4" />
        </MenuButton>
      </div>

      {/* Link */}
      <div className="flex items-center gap-1 px-2 border-r border-gray-300 dark:border-gray-600">
        {showLinkInput ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="w-32 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  setLink()
                }
                if (e.key === 'Escape') {
                  setShowLinkInput(false)
                  setLinkUrl('')
                }
              }}
              autoFocus
            />
            <button
              type="button"
              onClick={setLink}
              className="px-2 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLinkInput(false)
                setLinkUrl('')
              }}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
            >
              Annuler
            </button>
          </div>
        ) : (
          <MenuButton
            onClick={() => {
              const previousUrl = editor.getAttributes('link').href
              setLinkUrl(previousUrl || '')
              setShowLinkInput(true)
            }}
            isActive={editor.isActive('link')}
            title="Lien"
          >
            <LinkIcon className="w-4 h-4" />
          </MenuButton>
        )}
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5 pl-2">
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Annuler (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="R\u00e9tablir (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </MenuButton>
      </div>
    </div>
  )
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = '\u00c9crivez votre contenu ici...',
  label,
  error,
  required,
  minHeight = '200px',
  maxHeight = '400px',
  showPreview: initialShowPreview = false,
  disabled = false
}: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(initialShowPreview)
  const [charCount, setCharCount] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3]
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline hover:text-primary-700'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const text = editor.getText()
      setCharCount(text.length)
      onChange(html, text)
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none px-4 py-3 overflow-y-auto`,
        style: `min-height: ${minHeight}; max-height: ${maxHeight}`
      }
    }
  })

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className={`border rounded-lg overflow-hidden transition-colors ${
        error
          ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-200'
          : 'border-gray-300 dark:border-gray-600 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 dark:focus-within:ring-primary-900'
      } ${disabled ? 'opacity-60 bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}>

        {/* Menu Bar */}
        <div className="flex items-center justify-between">
          <MenuBar editor={editor} />
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title={showPreview ? 'Masquer la pr\u00e9visualisation' : 'Afficher la pr\u00e9visualisation'}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Editor / Preview */}
        <div className={showPreview ? 'grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700' : ''}>
          {/* Editor */}
          <div className={showPreview ? 'overflow-hidden' : ''}>
            <EditorContent editor={editor} />
          </div>

          {/* Preview */}
          {showPreview && (
            <div
              className="prose prose-sm dark:prose-invert max-w-none px-4 py-3 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto"
              style={{ minHeight, maxHeight }}
              dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
          <span>{charCount} caract\u00e8res</span>
          <span className="text-gray-400">
            Ctrl+B: Gras | Ctrl+I: Italique | Ctrl+Z: Annuler
          </span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

// Export a simple version for smaller use cases
export function SimpleRichTextEditor({
  content,
  onChange,
  placeholder,
  minHeight = '120px'
}: {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        horizontalRule: false
      }),
      Link.configure({
        openOnClick: false
      }),
      Placeholder.configure({
        placeholder: placeholder || '\u00c9crivez ici...'
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none px-3 py-2',
        style: `min-height: ${minHeight}`
      }
    }
  })

  return (
    <div className="border rounded-lg border-gray-300 dark:border-gray-600 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="flex items-center gap-1 p-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <MenuButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          isActive={editor?.isActive('bold')}
          title="Gras"
        >
          <Bold className="w-3.5 h-3.5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          isActive={editor?.isActive('italic')}
          title="Italique"
        >
          <Italic className="w-3.5 h-3.5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          isActive={editor?.isActive('bulletList')}
          title="Liste"
        >
          <List className="w-3.5 h-3.5" />
        </MenuButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
