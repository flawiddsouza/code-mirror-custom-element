export class CustomElement extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }
}
