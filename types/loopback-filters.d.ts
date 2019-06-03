declare module 'loopback-filters' {
  export interface Filter {
    fields?: string | any | any[];
    include?: string | any | any[];
    limit?: number;
    order?: string;
    skip?: number;
    where?: any;
  }
  export default function filter<TIn>(value: TIn, filterParam: Filter): TIn;
}
