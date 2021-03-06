import { Component, AfterViewInit, OnDestroy, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { ModalInstance, ModalResult } from './modal-instance';

export class ModalSize {
  static Small = 'sm';
  static Large = 'lg';

  static validSize(size: string) {
    return size && (size === ModalSize.Small || size === ModalSize.Large);
  }
}

@Component({
  selector: 'campus-modal',
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss']
})
export class ModalComponent implements AfterViewInit, OnDestroy {

  instance: ModalInstance;
  overrideSize: string = null;
  visible = false;
  @Input() animation = true;
  @Input() backdrop: any = true;
  @Input() keyboard = true;
  @Input() size: string;
  @Output() onClose: EventEmitter<any> = new EventEmitter(false);
  @Output() onDismiss: EventEmitter<any> = new EventEmitter(false);
  @Output() onOpen: EventEmitter<any> = new EventEmitter(false);

  constructor(private element: ElementRef) {
  }

  ngAfterViewInit() {
    this.instance = new ModalInstance(this.element);
    this.instance.hidden.subscribe((result) => {
      this.visible = this.instance.visible;
      if (result === ModalResult.Dismiss) {
        this.onDismiss.emit(undefined);
      }
    });
    this.instance.shown.subscribe(() => {
      this.onOpen.emit(undefined);
    });
  }

  ngOnDestroy() {
    return this.instance && this.instance.destroy();
  }

  open(size?: string): Promise<any> {
    if (ModalSize.validSize(size)) {
      this.overrideSize = size;
    }
    return this.instance.open().then(() => {
      this.visible = this.instance.visible;
    });
  }

  close(): Promise<any> {
    return this.instance.close().then(() => {
      this.onClose.emit(undefined);
    });
  }

  dismiss(): Promise<any> {
    return this.instance.dismiss().then(() => {
      // this.onDismiss.emit(undefined);
    });
  }

  public isSmall() {
    return this.overrideSize !== ModalSize.Large && this.size === ModalSize.Small || this.overrideSize === ModalSize.Small;
  }

  public isLarge() {
    return this.overrideSize !== ModalSize.Small && this.size === ModalSize.Large || this.overrideSize === ModalSize.Large;
  }
}
