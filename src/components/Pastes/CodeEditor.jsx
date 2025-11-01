import Editor from "@monaco-editor/react";
import { useTheme } from "@/hooks/useTheme";
import { useRef } from "react";
import PropTypes from "prop-types";
import { loader } from '@monaco-editor/react';

loader.config({
    'vs/nls': {
        availableLanguages: { '*': 'es' },
    },
});

const CodeEditor = ({ className = "", syntax, readOnly, onChange, value }) => {
    const { theme } = useTheme();
    const editorRef = useRef(null);

    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    }

    return (
        <div className={`code-editor ${className}`}>
            <Editor
                language={syntax || "plaintext"}
                value={value || ""}
                theme={theme === "dark" ? "vs-dark" : "vs-light"}
                onChange={(value) => onChange?.(value)}
                onMount={onMount}
                options={{
                    minimap: { enabled: false },
                    automaticLayout: true,
                    fontFamily: 'Fira Code',
                    fontLigatures: true,
                    fontSize: 18,
                    lineHeight: 1.5,
                    scrollbar: { verticalScrollbarSize: 0 },
                    wordWrap: "on",
                    formatOnPaste: true,
                    suggest: {
                        showFields: true,
                        showFunctions: true,
                    },
                    readOnly: readOnly || false,
                }}
            />
        </div>
    );
};

CodeEditor.propTypes = {
    className: PropTypes.string,
    syntax: PropTypes.string,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func,
    value: PropTypes.string,
};

export default CodeEditor;
