import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';

@Pipe({
  name: 'squeezeNumber'
})
export class SqueezeNumberPipe implements PipeTransform {

  transform(value: any, args?): any {
    const arg = args ? args.split(',') || [] : [];
    const maxLength = Number(arg[0]) || 8;
    const decimals = Number(arg[1]) || 2;
    const numberLength = value.length;
    if (numberLength > maxLength) {
      return new BigNumber(value).toFixed(decimals);
    }

    return value;
  }

}
