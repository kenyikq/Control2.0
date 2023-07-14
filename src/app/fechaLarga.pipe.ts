import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

@Pipe({
    name: 'fechaLarga'
  })
  export class FechaLargaPipe implements PipeTransform {
    transform(value: string): string {
      return format(new Date(value), "PPPP", { locale: es });
    }
  }