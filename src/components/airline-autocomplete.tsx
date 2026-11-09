import { AirportAutocomplete } from "./airport-autocomplete";

export function AirlineAutocomplete(props: Omit<React.ComponentProps<typeof AirportAutocomplete>, 'type'>) {
  return <AirportAutocomplete {...props} type={"airline"} />;
}

export default AirlineAutocomplete;
