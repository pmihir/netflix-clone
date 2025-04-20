import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";

import { HomeContainerProps } from "./types";

export const HomeContainer = ({ children }: HomeContainerProps.Default) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};
