import { CustomElement } from './custom-element'
import {
    EditorView,
    highlightActiveLine,
    keymap,
    highlightSpecialChars,
    drawSelection,
    lineNumbers,
    highlightActiveLineGutter
} from '@codemirror/view'
import { EditorState } from '@codemirror/state'
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
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'

function createState(language, documentText, updateCallback) {
    let languageFunc = null

    if (language === 'javascript') {
        languageFunc = javascript()
    }

    if (language === 'html') {
        languageFunc = html()
    }

    if (language === 'css') {
        languageFunc = css()
    }

    if (language === 'json') {
        languageFunc = json()
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
            // having drawSelection allows you to have the selection highlighting
            // when you do ctrl-d to select the next match of the selected text
            // otherwise when ctrl-d selects the next match, you won't see any
            // selection highlighting
            // quick trivia: ctrl+d comes from searchKeymap - i thought it came
            // with the defaultKeymap but guess not
            drawSelection(),
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

    attributeChangedCallback(name, _oldValue, newValue) {
        if(!this.editor) {
            return
        }

        if(name === 'lang') {
            this.editor.setState(createState(newValue, this.value, (value) => {
                this.value = value
                this.dispatchEvent(new Event('input'))
            }))
        }

        if(name === 'value') {
            this.editor.setState(createState(this.lang, newValue, (value) => {
                this.value = value
                this.dispatchEvent(new Event('input'))
            }))
        }
    }

    connectedCallback() {
        this.lang = this.getAttribute('lang') ?? 'javascript'
        this.value = this.getAttribute('value') ?? ''
        this.editor = null

        this.shadowRoot.innerHTML = /* html */ `
            <div id="code-mirror-editor"></div>
            <style>
            :host {
                display: block;
                height: 100%;
                overflow: auto;
            }

            #code-mirror-editor {
                height: 100%;
            }

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

            #code-mirror-editor .cm-editor.cm-focused .cm-activeLine,
            #code-mirror-editor .cm-editor.cm-focused .cm-activeLineGutter {
                background-color: rgb(130, 130, 130, 0.1);
            }

            #code-mirror-editor .cm-editor:not(.cm-focused) .cm-activeLine,
            #code-mirror-editor .cm-editor:not(.cm-focused) .cm-activeLineGutter {
                background-color: transparent;
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
