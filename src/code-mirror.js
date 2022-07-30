import { html, css, LitElement } from 'lit'

class CodeMirror extends LitElement {
    static get properties() {
        return {
            value: {
                type: String
            }
        }
    }

    constructor() {
        super()
        this.value = ''
    }

    render() {
        return html`
            <div id="code-mirror-editor">${this.value}</div>
        `
    }

    static get styles() {
        return css`
            #code-mirror-editor .cm-editor.cm-focused {
                outline: 0 !important;
            }

            #code-mirror-editor .cm-gutters {
                user-select: none;
                background-color: inherit;
                border-right: 0;
            }

            #code-mirror-editor .cm-scroller {
                font-family: var(--font-monospace);
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
        `
    }
}

window.customElements.define('code-mirror', CodeMirror)
