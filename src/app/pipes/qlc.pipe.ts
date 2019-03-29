import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'qlc'
})
export class QlcPipe implements PipeTransform {
  precision = 6;

	QLC = 100000000; // 10^8

  transform(value: any, args?: any): any {
    let decimals = 2
    if (args) {
      const opts = args.split(',');
      decimals = opts[0];
    }
    
    return `${(value / this.QLC).toFixed(decimals)}`;
  }

}
