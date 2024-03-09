import { inspect as i } from 'util';

export default function inspect(data: any) {
  return i(data, { depth: null, colors: true });
}
