import { Hide } from "../../../Hide";
import { Show } from "../../../Show";

import { getCompanies } from "../../../../utils/getCompanies";
import { PreviewMovieProps } from "../../types";

export const ProductionCompanies = ({
  companies,
}: PreviewMovieProps.ProductionCompanies) => {
  return (
    <div>
      <span>Producers: </span>
      <span>
        <Show when={companies.length > 0}>{getCompanies(companies)}</Show>

        <Hide when={companies.length > 0}>
          Oops, we couldn't find the producers of this title.
        </Hide>
      </span>
    </div>
  );
};
