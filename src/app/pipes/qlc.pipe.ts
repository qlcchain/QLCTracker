import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'qlc'
})
export class QlcPipe implements PipeTransform {
  precision = 6;

	QLC = 100000000; // 10^8

  transform(value: any, args?: any): any {
    return `${(value / this.QLC).toFixed(2)}`;
  }

}
