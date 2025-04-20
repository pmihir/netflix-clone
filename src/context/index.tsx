import { PreviewProvider } from "./PreviewContext";

type AppProviderProps = {
  children: React.ReactNode;
};

const AppProvider = ({ children }: AppProviderProps) => (
  <PreviewProvider>{children}</PreviewProvider>
);

export default AppProvider;
