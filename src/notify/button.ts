import * as Utils from "./utils";

export class NotyButton {
  dom: HTMLButtonElement;
  id: any;
  cb: any;
  constructor(html, classes, cb, attributes: any = {}) {
    this.dom = document.createElement("button");
    this.dom.innerHTML = html;
    this.id = attributes.id = attributes.id || Utils.generateID("button");
    this.cb = cb;
    Object.keys(attributes).forEach((propertyName) => {
      this.dom.setAttribute(propertyName, attributes[propertyName]);
    });
    Utils.addClass(this.dom, classes || "noty_btn");

    return this;
  }
}
