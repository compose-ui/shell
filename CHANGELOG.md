## 2.1.3

- Set the value in the input even if it's unparsable / unserializable.

## 2.1.2

- Puts the cursor at the end of the field when focused via tabbing. @imathis

## 2.1.1

- Fixed focus bugginess. Added the `focus` attribute on `compose-param`s to specify which field to focus on when the component is all ready. @imathis

## 2.1.0

Uses x-tag which has better polyfills. Still feels like a web component, but coded more traditionally.

## 2.0.0

Used web components via Polymer. Turned out not to be compatible with many browsers, even with polyfills.

## 1.0.0

First version which used reactive templates and all. Turned out to be pretty heavy for our purposes.