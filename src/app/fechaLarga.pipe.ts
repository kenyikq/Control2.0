import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

@Pipe({
    name: 'fechaLarga'
  })
  export class FechaLargaPipe implements PipeTransform {
    transform(value: string): string {

      const fechaString = value;
const parts = fechaString.split("-");
const year = parseInt(parts[0]);
const month = parseInt(parts[1]) - 1; // Restamos 1 porque los meses en JavaScript comienzan desde 0 (enero es el mes 0)
const day = parseInt(parts[2]);
const fecha = new Date(year, month, day);

      return format(new Date(fecha), "PPPP", { locale: es });
    }
  }