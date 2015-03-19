# Compose Shell

A web component for displaying a versatile shell-like interface.

## Installation

### Browserify & npm

Simply `npm install compose-shell` and require it in your project. The package doesn't export anything.

### Load the `dist`

- Look in `dist/` for both minified and unminified sources.
- There's some CSS required to make this work. `shell.css`
- Source map available.

## Usage

This is a web component. Which means, you don't manually trigger it. Just follow the simple HTML guidelines to making it work.

### Basic HTML structure

Within your site, you need a structure similar to this:

```html
<compose-shell method="get" action="path_to_action">
  <!-- Example params group -->
  <compose-shell-param name="find" before="find(" after=")">
    <compose-shell-param name="find[query]" required="true" before="{" after="}" type="hash" parser="bson"></compose-shell-param>
    <compose-shell-param name="find[fields]" before=",{" after="}" type="hash" hint="Fields" parser="bson"></compose-shell-param>
  </compose-shell-param>

  <!-- Example standalone params -->
  <compose-shell-param name="sort" before=".sort({" after="})" type="hash" parser="bson"></compose-shell-param>
  <compose-shell-param name="explain" type="boolean">.explain()</compose-shell-param>
  
  <!-- Buttons referecing the fields -->
  <compose-shell-button toggle="find[fields]">fields{}</compose-shell-button>
  <compose-shell-button toggle="sort">sort()</compose-shell-button>
  <compose-shell-button toggle="explain">explain()</compose-shell-button>

  <!-- A submit button -->
  <compose-shell-button type="submit">Run</compose-shell-button>
</compose-shell>
```

There's a lot more examples of this in the `examples.html` file. If you pull/download the repository, you can load the file up in a browser and it should work fine.

### `<compose-shell>`

The parent tag contains the whole shell parameters and buttons (more on this below.)

**Any attributes passed to it will be applied to the `form` that'll be submitted**

### `<compose-shell-param>`

... can either be a standalone param or a group of params.

#### Relevant attributes

- **name**: the `name` to send as an input within the form. Also used to reference the param by other attributes / elements.
- **before**: text to display before the input. For a hash, there's often a "{" or "({" in there.
- **after**: same as `before`, but after.
- **required**: some fields don't have buttons and therefore must be marked as required so that they're visible even without the button being toggled.
- **type**: the type of the parameter. can be a "hash", "boolean", "text"
- **parser**: the type of parser to use on the parameter when parsing and serializing its value. For now only bson is supported (MongoDB), if none is specified, it'll just passthrough the value as is.
- **hint**: a small tooltip to display when the parameter is toggled.
- **dependency**: a dependency of the parameter (this is the **name** of another attribute.)
- **focus**: specify the field to focus on when the shell is fully ready.

#### Element's text content

Parameters of type **boolean** can have content within the `<compose-shell-param>` tag. This will be displayed as their label.

### `<compose-shell-button>`

Button to toggle the field on or off.

#### Relevant attributes

The only relevant attribute is **toggle**, it corresponds to the **name** of the parameter to toggle.

#### Element's text content

... is used for the label on the button