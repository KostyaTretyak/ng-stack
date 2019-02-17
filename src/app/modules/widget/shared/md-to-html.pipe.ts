import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Marked, Renderer } from 'marked-ts';

@Pipe({ name: 'mdToHtml' })
export class MdToHtmlPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(Marked.parse(value || ''));
  }
}

class MyRenderer extends Renderer {
  image(href: string, title: string, text: string): string {
    let out = '<img src="' + href + '" alt="' + text + '"';

    if (title) {
      out += ' title="' + title + '"';
    }

    out += this.options.xhtml ? '/>' : '>';
    return out;
  }
}

Marked.setOptions({
  renderer: new MyRenderer(),
  isNoP: true,
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  mangle: true,
  smartLists: false,
  silent: false,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  xhtml: false,
});
