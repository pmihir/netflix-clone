import { useState } from "react";

import { Show } from "../Show";
import { Hide } from "../Hide";

import { AiOutlinePicture } from "react-icons/ai";
import styles from "./styles.module.scss";

import { CardProps } from "./types";

export const Card = ({ title, poster_path, onClick }: CardProps.Default) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  return (
    <div className={styles.cardContainer} role="button" onClick={onClick}>
      <Show when={poster_path != null}>
        <Show when={isLoading}>
          <div className={styles.skeleton} />
        </Show>

        <img
          style={!isLoading ? { display: "block" } : { display: "none" }}
          src={`https://image.tmdb.org/t/p/w300${poster_path}`}
          onLoad={() => setIsLoading(false)}
          alt={title}
        />
      </Show>

      <Hide when={poster_path != null}>
        <div className={styles.error}>
          <div>
            <p>{title ?? "Title not found..."}</p>
            <AiOutlinePicture />
          </div>
        </div>
      </Hide>
    </div>
  );
};
