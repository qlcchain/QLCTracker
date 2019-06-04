import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'qlc'
})
export class QlcPipe implements PipeTransform {
  precision = 6;

	QLC = 100000000; // 10^8

  transform(value: any, args?: any): any {
    if (value == 'NaN' || value == NaN || value == undefined) {
      value = 0;
    }
    let decimals = 2
    if (args != undefined) {
      //const opts = args.split(',');
      //decimals = args;
      if (args == 0) {
        this.QLC = 1;
      } else {
        this.QLC = Math.pow(10,args);
      }
    }
    
    
    return `${(value / this.QLC).toFixed(args)}`;
  }

}
