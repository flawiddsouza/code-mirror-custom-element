### Install
```sh
npm i code-mirror-custom-element
```

### Usage:
```js
import 'code-mirror-custom-element'
```

```html
<code-mirror lang="javascript" value="let a = 10;" autofocus></code-mirror>
```

### To use in browser, without npm:

Download [dist/code-mirror-custom-element.js](https://github.com/flawiddsouza/code-mirror-custom-element/blob/main/dist/code-mirror-custom-element.js?raw=true)

In your html file, add:
```html
<script type="module" src="code-mirror-custom-element.js"></script>
<code-mirror lang="javascript" value="let a = 10;" autofocus></code-mirror>
```

And you're done.

### Caveats:

Only lang="javascript" is supported as of now. Please [create an issue in github](https://github.com/flawiddsouza/code-mirror-custom-element/issues/new) to add support for the language you want.
