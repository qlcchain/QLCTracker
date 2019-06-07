import { Directive } from '@angular/core';
import { ValidatorFn, AbstractControl } from '@angular/forms';

@Directive({
  selector: '[appAmountValidator]'
})
export class AmountValidatorDirective {

  constructor() {
  }

}
export function minAmountValidator(minAmount: Number): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const forbidden = control.value < minAmount ? true : false;
    return forbidden ? {'minAmount': {value: control.value}} : null;
  };
}