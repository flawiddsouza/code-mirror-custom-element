import { CustomElement } from './custom-element'
import {
    EditorView,
    highlightActiveLine,
    keymap,
    highlightSpecialChars,
    lineNumbers,
    highlightActiveLineGutter
} from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import {
    defaultHighlightStyle,
    syntaxHighlighting,
    indentOnInput,
    indentUnit,
    bracketMatching,
    foldGutter,
    foldKeymap
} from '@codemirror/language'
import {
    defaultKeymap,
    history,
    indentWithTab,
    historyKeymap
} from '@codemirror/commands'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'

function createState(language, documentText, updateCallback) {
    let languageFunc = null

    if (language === 'javascript') {
        languageFunc = javascript()
    }

    return EditorState.create({
        doc: documentText,
        extensions: [
            languageFunc,
            history(),
            lineNumbers(),
            highlightActiveLine(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
            highlightSelectionMatches(),
            indentOnInput(),
            indentUnit.of('    '), // 4 spaces
            syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
            bracketMatching(),
            closeBrackets(),
            foldGutter({ openText: '▾', closedText: '▸' }),
            autocompletion(),
            EditorView.lineWrapping,
            EditorView.updateListener.of((v) => {
                if (v.docChanged) {
                    updateCallback(v.state.doc.toString())
                }
            }),
            keymap.of([
                ...defaultKeymap,
                ...historyKeymap,
                indentWithTab,
                ...searchKeymap,
                ...foldKeymap,
                ...completionKeymap,
                ...closeBracketsKeymap
            ])
        ]
    })
}

class CodeMirror extends CustomElement {
    constructor() {
        super()
    }

    static get observedAttributes() {
        return ['lang', 'value']
    }

    attributeChangedCallback(name, oldValue, newValue) {
    }

    connectedCallback() {
        this.lang = this.getAttribute('lang') ?? 'javascript'
        this.value = this.getAttribute('value') ?? ''
        this.editor = null

        this.shadowRoot.innerHTML = /* html */ `
            <div id="code-mirror-editor"></div>
            <style>
            #code-mirror-editor .cm-editor.cm-focused {
                outline: 0 !important;
            }

            #code-mirror-editor .cm-gutters {
                user-select: none;
                background-color: inherit;
                border-right: 0;
            }

            #code-mirror-editor .cm-scroller {
                font-family: Menlo, Monaco, Consolas, 'Droid Sans Mono', 'Courier New', monospace, 'Droid Sans Fallback';
                font-size: 14px;
                overflow: auto;
            }

            #code-mirror-editor .cm-activeLine,
            #code-mirror-editor .cm-activeLineGutter {
                background-color: rgb(130, 130, 130, 0.1);
            }

            #code-mirror-editor .cm-foldGutter span {
                font-size: 1.1rem;
                line-height: 1.1rem;
                color: rgb(130, 130, 130, 0.5);
            }

            #code-mirror-editor .cm-foldGutter span:hover {
                color: #999999;
            }

            #code-mirror-editor .cm-editor {
                height: 100%;
            }
            </style>
        `

        this.editor = new EditorView({
            state: createState(this.lang, this.value, (value) => {
                this.value = value
                this.dispatchEvent(new Event('input'))
            }),
            parent: this.shadowRoot.querySelector('#code-mirror-editor')
        })

        if(this.hasAttribute('autofocus')) {
            this.editor.focus()
        }
    }
}

customElements.define('code-mirror', CodeMirror)
