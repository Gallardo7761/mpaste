import Editor from "@monaco-editor/react";
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import * as monaco from "monaco-editor";

const CodeEditor = ({ className = "", syntax, readOnly, onChange, value, editorErrors = [] }) => {
    const { theme } = useTheme();
    const editorRef = useRef(null);

    useEffect(() => {
        if (!editorRef.current) return;
        const model = editorRef.current.getModel();
        if (!model) return;

        monaco.editor.setModelMarkers(model, "owner", editorErrors.map(err => ({
            startLineNumber: err.lineNumber,
            startColumn: 1,
            endLineNumber: err.lineNumber,
            endColumn: model.getLineLength(err.lineNumber) + 1,
            message: err.message,
            severity: monaco.MarkerSeverity.Error
        })));
    }, [editorErrors]);

    const onMount = (editor) => { editorRef.current = editor; editor.focus(); }

    return (
        <div className={`code-editor ${className}`}>
            <Editor
                language={syntax || "plaintext"}
                value={value || ""}
                theme={theme === "dark" ? "vs-dark" : "vs-light"}
                onChange={onChange}
                onMount={onMount}
                options={{
                    minimap: { enabled: true },
                    automaticLayout: true,
                    fontFamily: 'Fira Code',
                    fontLigatures: true,
                    fontSize: 18,
                    lineHeight: 1.5,
                    scrollbar: { verticalScrollbarSize: 10 },
                    wordWrap: "on",
                    formatOnPaste: true,
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
    editorErrors: PropTypes.array,
};

export default CodeEditor;