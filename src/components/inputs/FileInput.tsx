import React, { useRef, useState } from 'react'
import COLORS from '../../utils/colors'

export interface FileInputProps {
    allowMultiple?: boolean
    onChange?: (e: { target: { files: File[]; name?: string; id?: string; value?: string } }) => void
    name?: string
    /** Accepted MIME types / extensions */
    accept?: string
    [key: string]: any
}

/**
 * Drag-and-drop / click file input.
 *
 * Decoupled from ThemeContext — uses CSS `dark:` classes.
 *
 * @example
 * <FileInput
 *   name="xlsxUpload"
 *   accept=".xlsx"
 *   onChange={(e) => setFile(e.target.files[0])}
 * />
 */
export default function FileInput({
    allowMultiple = false,
    onChange,
    name,
    accept = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx',
}: FileInputProps) {
    const fileInput = useRef<HTMLInputElement>(null)
    const [files, setFiles] = useState<File[]>([])

    const openPicker = () => {
        fileInput.current?.dispatchEvent(new MouseEvent('click', { bubbles: false }))
    }

    const handleFiles = (list: File[]) => {
        setFiles(list)
        onChange?.({ target: { files: list } })
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const fileList: File[] = []
        if (e.dataTransfer.items) {
            for (let i = 0; i < e.dataTransfer.items.length; i++) {
                if (e.dataTransfer.items[i].kind === 'file') {
                    const f = e.dataTransfer.items[i].getAsFile()
                    if (f) fileList.push(f)
                }
            }
        } else {
            for (let i = 0; i < e.dataTransfer.files.length; i++) {
                fileList.push(e.dataTransfer.files[i])
            }
        }
        handleFiles(fileList)
    }

    const localOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(Array.from(e.target.files ?? []))
    }

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation()
        setFiles([])
        onChange?.({ target: { files: [], name, id: name, value: '' } })
        if (fileInput.current) fileInput.current.value = ''
    }

    return (
        <div
            onClick={openPicker}
            className="border-2 hover:border-prussian-blue border-ice-dark w-full h-full rounded-md transition-all duration-300 border-dashed dark:border-independence hover:dark:border-ice-dark cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
        >
            <input
                id={name}
                name={name}
                onChange={localOnChange}
                ref={fileInput}
                hidden
                type="file"
                accept={accept}
                multiple={allowMultiple}
            />

            {files.length === 0 ? (
                <div className="flex flex-col h-full items-center justify-center gap-2">
                    {/* Upload icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={COLORS.PALETTE['prussian-blue']} className="w-16 h-16 dark:fill-white">
                        <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                    </svg>
                    <div className="text-prussian-blue dark:text-white text-sm">Click or Drop a file</div>
                </div>
            ) : (
                <div className="flex gap-3 items-center justify-center w-full h-full">
                    {files.map((file, id) => (
                        <div
                            key={`${id}${file.name}`}
                            className="text-xs flex flex-col items-center w-20 h-24 text-center bg-ice-dark p-4 dark:bg-independence rounded-md relative"
                        >
                            <button
                                type="button"
                                onClick={removeFile}
                                className="bg-error rounded-full w-4 h-4 absolute right-[-5px] top-[-5px] cursor-pointer flex items-center justify-center"
                                aria-label="Remove file"
                            >
                                <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
                                    <path d="M15 5L5 15M5 5l10 10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            {/* File icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={COLORS.PALETTE['prussian-blue']} className="w-10 h-10 dark:fill-white">
                                <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" clipRule="evenodd" />
                                <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                            </svg>
                            <span className="text-ellipsis whitespace-nowrap overflow-hidden w-full text-prussian-blue dark:text-white">
                                {file.name}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
