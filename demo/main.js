const js = document.querySelector('#js')
const html = document.querySelector('#html')
const css = document.querySelector('#css')
const iframe = document.querySelector('#iframe')
const templateSelector = document.querySelector('#template-selector')
const loadTemplateButton = document.querySelector('#load-template')

const templates = {
    'Clean': {
        js: '',
        html: '',
        css: ''
    },
    'Vue 3': {
        js: `
const { createApp } = Vue

createApp({
    data() {
        return {
            message: 'Hello Vue!'
        }
    }
}).mount('#app')
        `,
        html: `
<script src="https://unpkg.com/vue@3"></script>
<div id="app">{{ message }}</div>
        `,
        css: ''
    }
}

// From: https://dev.to/pulljosh/how-to-load-html-css-and-js-code-into-an-iframe-2blc#solution-blob-urls
function getGeneratedPageURL({ html, css, js }) {
    const getBlobURL = (code, type) => {
        const blob = new Blob([code], { type })
        return URL.createObjectURL(blob)
    }

    const cssURL = getBlobURL(css, 'text/css')
    const jsURL = getBlobURL(js, 'text/javascript')

    const source = `
        <html>
            <head>
                ${css && `<link rel="stylesheet" type="text/css" href="${cssURL}" />`}
                ${js && `<script src="${jsURL}" defer></script>`}
            </head>
            <body>
                ${html || ''}
            </body>
        </html>
    `

    return getBlobURL(source, 'text/html')
}

function refreshIframe(overrides={}) {
    const url = getGeneratedPageURL({
        js: 'js' in overrides ? overrides.js : js.value,
        html: 'html' in overrides ? overrides.html : html.value,
        css: 'css' in overrides ? overrides.css : css.value
    })
    iframe.src = url
}

function setKey(key, value) {
    localStorage.setItem(`WebCodeFiddle-${key}`, JSON.stringify(value))
}

function getKey(key) {
    const value = localStorage.getItem(`WebCodeFiddle-${key}`)
    return value ? JSON.parse(value) : null
}

function loadTemplate(template) {
    if(!confirm('Loading a template will clear all the existing code in the editors. Are you sure?')) {
        return
    }

    const jsCode = templates[template].js.trim()
    const htmlCode = templates[template].html.trim()
    const cssCode = templates[template].css.trim()

    js.setAttribute('value', jsCode)
    setKey('js', jsCode)

    html.setAttribute('value', htmlCode)
    setKey('html', htmlCode)

    css.setAttribute('value', cssCode)
    setKey('css', cssCode)

    refreshIframe({
        js: js.getAttribute('value'),
        html: html.getAttribute('value'),
        css: css.getAttribute('value')
    })
}

js.addEventListener('input', () => {
    setKey('js', js.value)
    refreshIframe()
})

html.addEventListener('input', () => {
    setKey('html', html.value)
    refreshIframe()
})

css.addEventListener('input', () => {
    setKey('css', css.value)
    refreshIframe()
})

loadTemplateButton.addEventListener('click', () => {
    loadTemplate(templateSelector.value)
})

js.setAttribute('value', getKey('js') ?? '')
html.setAttribute('value', getKey('html') ?? '')
css.setAttribute('value', getKey('css') ?? '')

refreshIframe({
    js: js.getAttribute('value'),
    html: html.getAttribute('value'),
    css: css.getAttribute('value')
})
